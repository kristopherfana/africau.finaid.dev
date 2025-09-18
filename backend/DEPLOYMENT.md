# AWS Elastic Beanstalk Deployment Guide

This guide will help you deploy the AU Scholarship System Backend to AWS Elastic Beanstalk.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **EB CLI** installed (`pip install awsebcli`)
4. **Node.js 18.19.1+** and **npm 9.0.0+**

## Initial Setup

### 1. Install AWS EB CLI

```bash
pip install awsebcli
```

### 2. Configure AWS Credentials

```bash
aws configure
```

## Deployment Steps

### 1. Initialize Elastic Beanstalk Application

From the backend directory:

```bash
eb init
```

Follow the prompts:
- **Region**: Choose your preferred AWS region (e.g., us-east-1)
- **Application Name**: `au-scholarship-backend`
- **Platform**: Node.js
- **Platform Version**: Latest Node.js 18.x
- **SSH**: Choose if you want SSH access (recommended for debugging)

### 2. Create Environment

```bash
eb create production
```

Or for a specific environment name:

```bash
eb create au-scholarship-prod
```

### 3. Configure Environment Variables

Set these in the AWS Console or via EB CLI:

```bash
eb setenv NODE_ENV=production \
         JWT_SECRET="your-super-secure-jwt-secret-256-bits-long" \
         JWT_EXPIRES_IN="7d" \
         CORS_ORIGIN="https://your-frontend-domain.com" \
         FRONTEND_URL="https://your-frontend-domain.com" \
         MAIL_HOST="smtp.gmail.com" \
         MAIL_PORT=587 \
         MAIL_USER="your-email@gmail.com" \
         MAIL_PASS="your-app-password" \
         MAIL_FROM="noreply@africau.edu" \
         DEFAULT_ADMIN_EMAIL="admin@africau.edu" \
         DEFAULT_ADMIN_PASSWORD="YourSecureAdminPassword123!"
```

### 4. Deploy Application

```bash
eb deploy
```

### 5. Open Application

```bash
eb open
```

## Configuration Details

### Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `JWT_SECRET` | JWT signing secret (256-bit) | `your-super-secure-jwt-secret` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | Frontend domain for CORS | `https://your-domain.com` |
| `FRONTEND_URL` | Frontend URL for emails | `https://your-domain.com` |
| `MAIL_HOST` | SMTP server | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USER` | Email username | `your-email@gmail.com` |
| `MAIL_PASS` | Email password/app password | `your-app-password` |
| `MAIL_FROM` | From email address | `noreply@africau.edu` |
| `DEFAULT_ADMIN_EMAIL` | Default admin email | `admin@africau.edu` |
| `DEFAULT_ADMIN_PASSWORD` | Default admin password | `SecurePassword123!` |

### Database Configuration

The application uses SQLite for simplicity. The database file is stored at `/var/app/current/prod.db` on the EC2 instance.

**Note**: For production with high traffic, consider migrating to RDS (PostgreSQL/MySQL).

### File Uploads

File uploads are stored in `/var/app/current/uploads/` directory. For scalability, consider using AWS S3.

## Security Considerations

### 1. Environment Variables

- **Never commit sensitive data** to version control
- Use **AWS Systems Manager Parameter Store** or **AWS Secrets Manager** for sensitive values
- Set strong, unique passwords and secrets

### 2. HTTPS Configuration

- Enable HTTPS in your load balancer
- Update CORS configuration with your actual domain
- The application redirects HTTP to HTTPS automatically

### 3. Database Security

- SQLite is suitable for development and small applications
- For production, migrate to RDS with proper security groups
- Enable database encryption

## Monitoring and Logs

### View Logs

```bash
eb logs
```

### Monitor Health

```bash
eb health
eb status
```

### View Application in AWS Console

```bash
eb console
```

## Troubleshooting

### Common Issues

1. **Application won't start**: Check logs with `eb logs`
2. **Database errors**: Ensure Prisma migrations run correctly
3. **File upload issues**: Check permissions on uploads directory
4. **CORS errors**: Verify CORS_ORIGIN environment variable

### Database Migration Issues

If database issues occur:

```bash
eb ssh
cd /var/app/current
npx prisma db push
```

### Environment Variable Updates

After updating environment variables:

```bash
eb deploy
```

## Scaling

### Auto Scaling Configuration

Configure auto-scaling in the AWS Console:
- **Environment** → **Configuration** → **Capacity**
- Set min/max instances based on your needs
- Configure scaling triggers (CPU, memory, requests)

### Load Balancer Configuration

- Application Load Balancer is created automatically
- Configure health checks for `/health` endpoint
- Enable sticky sessions if needed

## Backup Strategy

### Database Backup

For SQLite (current setup):
```bash
eb ssh
sudo cp /var/app/current/prod.db /tmp/backup-$(date +%Y%m%d).db
```

### File Upload Backup

Consider implementing S3 backup for uploaded files.

## Migration to RDS (Recommended for Production)

1. Create RDS instance (PostgreSQL/MySQL)
2. Update Prisma schema datasource
3. Update DATABASE_URL environment variable
4. Run migrations: `npx prisma migrate deploy`

## Cost Optimization

- Use **t3.micro** or **t3.small** instances for low traffic
- Enable **auto-scaling** to handle traffic spikes
- Monitor costs with **AWS Cost Explorer**
- Consider **Reserved Instances** for long-term deployments

## Support

For deployment issues:
1. Check AWS CloudWatch logs
2. Review EB application health
3. Verify environment configuration
4. Check application logs with `eb logs`

## Environment-Specific Commands

### Development Environment
```bash
eb create au-scholarship-dev --envvars NODE_ENV=development
```

### Staging Environment
```bash
eb create au-scholarship-staging --envvars NODE_ENV=staging
```

### Production Environment
```bash
eb create au-scholarship-prod --envvars NODE_ENV=production
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `eb init` | Initialize EB application |
| `eb create <env>` | Create new environment |
| `eb deploy` | Deploy current version |
| `eb open` | Open application in browser |
| `eb logs` | View application logs |
| `eb ssh` | SSH into EC2 instance |
| `eb terminate <env>` | Terminate environment |
| `eb setenv KEY=VALUE` | Set environment variables |

---

**Important**: Always test in a staging environment before deploying to production!