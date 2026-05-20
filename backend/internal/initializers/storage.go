package initializers

import (
	"context"
	"fmt"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/storage"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var Storage *storage.S3Provider

func InitS3Storage() error {
	endpoint := os.Getenv("S3_ENDPOINT")
	accessKey := os.Getenv("S3_KEY")
	secretKey := os.Getenv("S3_SECRET")
	useSSL := os.Getenv("S3_USE_SSL") == "true"
	bucket := os.Getenv("S3_BUCKET")
	publicEndpoint := os.Getenv("S3_PUBLIC_HOST")

	if endpoint == "" || accessKey == "" || secretKey == "" {
		return fmt.Errorf("[StorageInit] Missing S3 environment variables")
	}

	signedEndpoint := publicEndpoint
	if publicEndpoint == "" {
		signedEndpoint = endpoint
	}

	client, err := minio.New(signedEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return fmt.Errorf("[StorageInit] Client Creation: %v", err)
	}

	Storage = &storage.S3Provider{
		Client:         client,
		BucketName:     bucket,
		PublicEndpoint: publicEndpoint,
	}

	_, err = client.BucketExists(context.Background(), bucket)
	if err != nil {
		return fmt.Errorf("[StorageInit] Connection/Bucket Check: %v", err)
	}

	return nil
}
