package storage

import (
	"context"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
)

type S3Provider struct {
	Client         *minio.Client
	BucketName     string
	PublicEndpoint string
}

// UploadOrReplace saves a file to MinIO.
func (s *S3Provider) UploadOrReplace(
	ctx context.Context,
	fileName string,
	reader io.Reader,
	size int64,
	contentType string,
) error {
	_, err := s.Client.PutObject(ctx, s.BucketName, fileName,
		reader, size, minio.PutObjectOptions{
			ContentType: contentType,
		})
	if err != nil {
		return fmt.Errorf("[S3Provider] PutObject: %w", err)
	}
	return nil
}

// GetPresignedURL generates a temporary link for the frontend
func (s *S3Provider) GetPresignedURL(
	ctx context.Context,
	object string,
) (string, error) {
	if object == "" {
		return "", nil
	}
	// Clean path for S3 standards
	object = strings.TrimPrefix(object, "/")
	expiry := time.Second * 3600

	isMinio := strings.Contains(s.Client.EndpointURL().Host, "minio")

	if isMinio {
		publicURL := fmt.Sprintf("http://%s/%s/%s",
			s.PublicEndpoint,
			s.BucketName,
			object)
		return publicURL, nil
	}

	presignedURL, err := s.Client.PresignedGetObject(
		ctx,
		s.BucketName,
		object,
		expiry,
		nil,
	)
	if err != nil {
		return "", err
	}

	urlStr := presignedURL.String()
	internalHost := s.Client.EndpointURL().Host

	if s.PublicEndpoint != "" && s.PublicEndpoint != internalHost {
		urlStr = strings.Replace(urlStr, internalHost,
			s.PublicEndpoint, 1)
	}

	return urlStr, nil
}
