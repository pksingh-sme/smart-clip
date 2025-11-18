# SmartClip Admin Manual

This manual provides instructions for administrators of the SmartClip platform. It covers all administrative functions and tools available to manage the platform.

## Table of Contents

1. [Administrator Access](#administrator-access)
   - [Logging In as Admin](#logging-in-as-admin)
   - [Admin Dashboard](#admin-dashboard)

2. [User Management](#user-management)
   - [Viewing Users](#viewing-users)
   - [Moderating Users](#moderating-users)
   - [Managing User Roles](#managing-user-roles)

3. [Video Management](#video-management)
   - [Viewing All Videos](#viewing-all-videos)
   - [Moderating Videos](#moderating-videos)
   - [Removing Inappropriate Content](#removing-inappropriate-content)

4. [Content Moderation](#content-moderation)
   - [AI Moderation System](#ai-moderation-system)
   - [Reviewing Flagged Content](#reviewing-flagged-content)
   - [Manual Moderation](#manual-moderation)

5. [System Monitoring](#system-monitoring)
   - [Viewing System Statistics](#viewing-system-statistics)
   - [Monitoring Performance](#monitoring-performance)
   - [Checking Logs](#checking-logs)

6. [Configuration Management](#configuration-management)
   - [System Settings](#system-settings)
   - [API Keys and Integrations](#api-keys-and-integrations)

## Administrator Access

### Logging In as Admin

1. Visit the SmartClip admin login page: `/admin/login`
2. Use the default admin credentials:
   - Email: admin@smartclip.com
   - Password: admin123
3. For security, change the default password immediately after first login
4. Enable two-factor authentication for additional security

### Admin Dashboard

The admin dashboard provides an overview of the platform's health and activity:

- **User Statistics**: Total users, new registrations
- **Video Statistics**: Total videos, uploads per day
- **Comment Statistics**: Total comments, recent activity
- **System Health**: Server status, database connection, cache status
- **Recent Activity**: Latest user registrations, video uploads, comments

## User Management

### Viewing Users

1. Navigate to the "Users" section in the admin panel
2. View all users in a table format with columns:
   - Username
   - Email
   - Registration Date
   - Status (Active/Inactive)
   - Role (User/Admin)
3. Use filters to search for specific users
4. Sort by any column to organize the data

### Moderating Users

1. Find the user you want to moderate in the users list
2. Click on the user's row to view details
3. Available actions:
   - **Activate/Deactivate Account**: Toggle user's ability to log in
   - **Reset Password**: Send password reset email
   - **View User Content**: See all videos and comments by this user
   - **Ban User**: Permanently ban the user from the platform

### Managing User Roles

1. Navigate to the user's profile in the admin panel
2. Click "Edit User"
3. Change the user's role:
   - **User**: Standard user privileges
   - **Admin**: Full administrative privileges
4. Click "Save Changes"

## Video Management

### Viewing All Videos

1. Navigate to the "Videos" section in the admin panel
2. View all videos in a table format with columns:
   - Title
   - Creator
   - Upload Date
   - Status (Processing/Available/Disabled)
   - Visibility (Public/Private/Unlisted)
   - Views
3. Use filters to search by status, visibility, or date range
4. Sort by any column to organize the data

### Moderating Videos

1. Find the video you want to moderate in the videos list
2. Click on the video's row to view details
3. Available actions:
   - **Change Status**: Set to Processing, Available, or Disabled
   - **Change Visibility**: Set to Public, Private, or Unlisted
   - **View Video**: Watch the video content
   - **View Comments**: See all comments on the video
   - **Remove Video**: Delete the video from the platform

### Removing Inappropriate Content

1. Identify the video that violates community guidelines
2. Click on the video in the admin panel
3. Review the content to confirm violation
4. Click "Remove Video"
5. Optionally add a note explaining the reason for removal
6. The video will be deleted and the user notified

## Content Moderation

### AI Moderation System

SmartClip uses AI-powered content moderation:

- **Content Analysis**: Automatic detection of inappropriate content
- **Flagging System**: Suspicious content is automatically flagged for review
- **Confidence Scoring**: AI provides confidence levels for moderation decisions
- **Continuous Learning**: System improves over time with human feedback

### Reviewing Flagged Content

1. Navigate to the "Flagged Content" section
2. Review videos and comments flagged by the AI system
3. Available actions:
   - **Approve**: Content is acceptable, remove flag
   - **Remove**: Content violates guidelines, delete it
   - **Request Review**: Send to another admin for second opinion
   - **Adjust AI Settings**: Modify sensitivity of AI detection

### Manual Moderation

1. Use the search function to find specific content
2. Review user reports and complaints
3. Investigate user accounts with multiple violations
4. Take appropriate action:
   - Warn user
   - Remove content
   - Suspend account temporarily
   - Ban user permanently

## System Monitoring

### Viewing System Statistics

1. Navigate to the "Statistics" section in the admin panel
2. View real-time data on:
   - User registrations
   - Video uploads
   - Comments posted
   - System resource usage
   - API request rates
3. Export data as CSV for further analysis

### Monitoring Performance

1. Check the "Performance" dashboard
2. Monitor:
   - Server response times
   - Database query performance
   - Cache hit rates
   - Error rates
3. Set up alerts for performance degradation

### Checking Logs

1. Navigate to the "Logs" section
2. Filter logs by:
   - Date range
   - Log level (Info, Warning, Error)
   - Component (Auth, Video, User, etc.)
3. Search logs for specific events or errors
4. Export logs for troubleshooting

## Configuration Management

### System Settings

1. Navigate to the "Settings" section
2. Configure platform-wide settings:
   - Site name and description
   - Default language
   - Registration requirements
   - Content policies
   - Email templates
3. Save changes to apply settings

### API Keys and Integrations

1. Navigate to the "Integrations" section
2. Manage API keys for:
   - AWS services
   - OpenAI API
   - Payment processors
   - Analytics services
3. Rotate keys for security
4. Monitor API usage and quotas

## Security Best Practices

### Admin Account Security

1. Use strong, unique passwords
2. Enable two-factor authentication
3. Regularly review account activity
4. Limit admin privileges to essential personnel only
5. Log out when finished with admin tasks

### Platform Security

1. Regularly update software dependencies
2. Monitor for security vulnerabilities
3. Implement rate limiting to prevent abuse
4. Use HTTPS for all communications
5. Regularly backup the database

### Data Privacy

1. Comply with data protection regulations (GDPR, CCPA)
2. Implement data retention policies
3. Provide users with data export options
4. Handle user deletion requests promptly
5. Encrypt sensitive data at rest and in transit

## Troubleshooting

### Common Admin Issues

1. **Cannot Access Admin Panel**
   - Check credentials
   - Verify admin role assignment
   - Clear browser cache and cookies

2. **Performance Issues**
   - Check server resource usage
   - Review database query performance
   - Optimize cache settings

3. **Content Moderation Problems**
   - Review AI moderation settings
   - Check for false positives
   - Retrain AI models with new data

### Contact Support

For technical issues not covered in this manual, contact the development team at pksingh.sme@gmail.com.