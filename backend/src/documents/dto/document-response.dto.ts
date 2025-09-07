import { ApiProperty } from '@nestjs/swagger';

export class DocumentResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the document',
  })
  id: string;

  @ApiProperty({
    example: 'transcript.pdf',
    description: 'Original filename',
  })
  fileName: string;

  @ApiProperty({
    example: 1024000,
    description: 'File size in bytes',
  })
  fileSize: number;

  @ApiProperty({
    example: 'application/pdf',
    description: 'MIME type of the file',
  })
  mimeType: string;

  @ApiProperty({
    enum: ['TRANSCRIPT', 'RECOMMENDATION', 'ID', 'PROOF_OF_INCOME', 'OTHER'],
    example: 'TRANSCRIPT',
    description: 'Type of document',
  })
  documentType: string;

  @ApiProperty({
    example: 'Official transcript',
    description: 'Description of the document',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the user who uploaded the document',
  })
  uploadedBy: string;

  @ApiProperty({
    example: '2024-01-01T10:00:00.000Z',
    description: 'Upload timestamp',
  })
  uploadedAt: Date;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'ID of the associated application',
    required: false,
  })
  applicationId?: string;

  // Internal field - not exposed in API
  filePath?: string;
}