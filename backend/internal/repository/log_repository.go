package repository

import (
	"context"
	"errors"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/models"
	"github.com/jmoiron/sqlx"
)

type LogRepository interface {
	// CreateLog queues a log message for asynchronous persistence.
	//
	// Behavior:
	// - returns nil once enqueued
	// - returns context error on cancellation
	// - returns overflow error when the channel is full
	CreateLog(ctx context.Context, log models.Log) error

	// GetLogs returns log records matching actor substring.
	//
	// This is a direct query path and remains synchronous.
	GetLogs(
		ctx context.Context,
		actor string,
		limit, offset int,
	) ([]models.Log, error)

	// Close gracefully stops background worker and flushes pending logs.
	Close()
}

type logRepository struct {
	db     *sqlx.DB
	logsCh chan models.Log
	doneCh chan struct{}
}

// NewLogRepository constructs a buffered log repository manager.
//
// bufferSize: number of log entries to buffer before backpressure.
func NewLogRepository(db *sqlx.DB, bufferSize int) LogRepository {
	repo := &logRepository{
		db:     db,
		logsCh: make(chan models.Log, bufferSize),
		doneCh: make(chan struct{}),
	}

	go repo.startWorker()
	return repo
}

func (r *logRepository) CreateLog(ctx context.Context, log models.Log) error {
	select {
	case r.logsCh <- log:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	default:
		return errors.New("[CreateLog] Log queue is full")
	}
}

func (r *logRepository) GetLogs(
	ctx context.Context,
	actor string,
	limit, offset int,
) ([]models.Log, error) {
	actorFilter := "%" + actor + "%"
	query := `
		SELECT id, actor, action, result, created_at
		FROM logs
		WHERE actor LIKE ?
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`
	rows, err := r.db.QueryContext(
		ctx,
		query,
		actorFilter,
		limit,
		offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []models.Log
	for rows.Next() {
		var logged models.Log
		if err := rows.Scan(
			&logged.ID,
			&logged.Actor,
			&logged.Action,
			&logged.Result,
			&logged.CreatedAt,
		); err != nil {
			return nil, err
		}
		logs = append(logs, logged)
	}

	return logs, rows.Err()
}

func (r *logRepository) startWorker() {
	for {
		select {
		case logEntry := <-r.logsCh:
			r.insertLog(context.Background(), logEntry)
		case <-r.doneCh:
			r.drainAndExit()
			return
		}
	}
}

func (r *logRepository) Close() {
	close(r.doneCh)
}

func (r *logRepository) insertLog(ctx context.Context, log models.Log) {
	q := `INSERT INTO logs (actor, action, result, created_at)
		VALUES (?, ?, ?, ?)`
	_, _ = r.db.ExecContext(ctx, q, log.Actor, log.Action, log.Result,
		log.CreatedAt)
}

func (r *logRepository) drainAndExit() {
	for logEntry := range r.logsCh {
		r.insertLog(context.Background(), logEntry)
	}
}
