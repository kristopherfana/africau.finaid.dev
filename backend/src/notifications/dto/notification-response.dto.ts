import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the notification',
  })
  id: string;

  @ApiProperty({
    example: 'Application Status Update',
    description: 'Title of the notification',
  })
  title: string;

  @ApiProperty({
    example: 'Your scholarship application has been approved!',
    description: 'Message content of the notification',
  })
  message: string;

  @ApiProperty({
    enum: ['APPLICATION_UPDATE', 'SYSTEM', 'SCHOLARSHIP_UPDATE', 'REMINDER'],
    example: 'APPLICATION_UPDATE',
    description: 'Type of notification',
  })
  type: string;

  @ApiProperty({
    example: false,
    description: 'Whether the notification has been read',
  })
  isRead: boolean;

  @ApiProperty({
    example: '2024-01-01T10:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;
}