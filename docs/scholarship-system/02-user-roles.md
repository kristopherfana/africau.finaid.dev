# User Roles and Permissions

## System Users

The Scholarship Management System will support four main user types: Students, Administrators, Development Office, and Sponsors.

## Student Role

### Profile Management
- Create and maintain personal profile
- Update contact information
- Manage academic details
- Upload profile picture

### Scholarship Activities
- Browse available scholarships
- Filter scholarships by criteria
- Submit scholarship applications
- Track application status in real-time
- View awarded scholarships
- Accept or decline scholarship offers

### Document Management
- Upload required documents:
  - Academic transcripts
  - Work-study forms
  - Recommendation letters
  - Financial need documentation
  - Identity documents
- View uploaded documents
- Replace or update documents before submission deadline

### Communication
- View announcements from administrators
- Access application feedback
- Contact support

## Development Office Role

### Primary Responsibilities
The Development Office is the primary entity responsible for managing scholarships and monitoring their impact over time.

### Scholarship Management (Exclusive Rights)
- Create new scholarships with multi-year tracking
- Edit existing scholarship details
- Set scholarship duration and recurring status
- Define eligibility criteria and award amounts
- Manage scholarship slots and availability
- Archive or deactivate scholarships
- Set scholarship start and end years

### Scholarship Monitoring
- Track yearly beneficiary statistics
- Monitor demographic distribution of recipients:
  - Gender demographics
  - Nationality distribution
  - Academic level breakdown
  - Program/field of study statistics
  - Age group analysis
- Track financial disbursements per year
- Generate annual scholarship impact reports
- View historical scholarship data across years
- Compare scholarship performance year-over-year

### Sponsor Relations
- Coordinate with sponsors on scholarship requirements
- Provide sponsors with impact reports
- Manage sponsor-specific scholarship configurations
- Track sponsor funding allocation

### Reporting and Analytics
- Generate comprehensive scholarship reports
- Export demographic data for analysis
- Create visual dashboards for scholarship impact
- Track multi-year scholarship trends
- Monitor budget utilization per scholarship

## Administrator Role

### Application Management
- Design and modify application forms
- Review submitted applications
- Filter applications by various criteria
- Approve or reject applications
- Add reviewer comments
- Manage application deadlines

### Limited Scholarship Access
- View scholarship details and statistics
- Cannot create or edit scholarships (Development Office exclusive)
- View scholarship application statistics
- Monitor application progress

### Sponsor Management
- Create and manage sponsor profiles
- Track sponsor contributions
- Generate sponsor-specific reports
- Send communications to sponsors
- Manage sponsor agreements

### System Administration
- Configure system settings
- Manage user accounts
- Set up email templates
- Configure notification rules
- Manage academic programs and levels
- Define nationality and demographic options

### Reporting and Analytics
- Generate various reports
- Export data in multiple formats
- View real-time dashboards
- Track system usage statistics
- Monitor application trends


## Sponsor Role

### Sponsor Dashboard Access
- View sponsored scholarships
- Track scholarship utilization
- Monitor beneficiary statistics
- Access impact reports

### Limited Management
- View application statistics for sponsored scholarships
- Receive notifications about scholarship milestones
- Download reports for sponsored scholarships

## Permission Matrix

| Feature | Student | Administrator | Development Office | Sponsor |
|---------|---------|---------------|--------------------|---------|
| View Scholarships | ✓ | ✓ | ✓ | ✓ (own) |
| Apply for Scholarships | ✓ | - | - | - |
| Upload Documents | ✓ | - | - | - |
| Review Applications | - | ✓ | ✓ | - |
| Create/Edit Scholarships | - | - | ✓ | - |
| Delete Scholarships | - | - | ✓ | - |
| Track Yearly Statistics | - | ✓ (view) | ✓ | ✓ (own) |
| Manage Demographics Data | - | - | ✓ | - |
| Manage Sponsors | - | ✓ | ✓ | - |
| Generate Reports | - | ✓ | ✓ | ✓ (own) |
| Manage Users | - | ✓ | - | - |
| System Configuration | - | ✓ | - | - |
| Access Audit Logs | - | ✓ | ✓ | - |
| Multi-Year Tracking | - | - | ✓ | ✓ (view) |