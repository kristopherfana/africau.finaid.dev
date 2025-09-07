import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { DocumentResponseDto } from './dto/document-response.dto';
import { Express, Response } from 'express';
import { Readable } from 'stream';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        documentType: {
          type: 'string',
          enum: ['TRANSCRIPT', 'RECOMMENDATION', 'ID', 'PROOF_OF_INCOME', 'OTHER'],
        },
        description: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        fileName: 'transcript.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        documentType: 'TRANSCRIPT',
        description: 'Official transcript',
        uploadedBy: 'John Doe',
        uploadedAt: '2024-01-01T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file' })
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Query('documentType') documentType: string,
    @Query('description') description?: string,
  ): Promise<DocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.documentsService.upload(file, documentType, description);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload multiple documents (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Documents uploaded successfully',
    schema: {
      type: 'array',
      items: {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          fileName: 'document.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
        },
      },
    },
  })
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]): Promise<DocumentResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    return this.documentsService.uploadMultiple(files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents for current user' })
  @ApiQuery({ name: 'documentType', required: false, enum: ['TRANSCRIPT', 'RECOMMENDATION', 'ID', 'PROOF_OF_INCOME', 'OTHER'] })
  @ApiQuery({ name: 'applicationId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of documents',
    schema: {
      type: 'array',
      items: {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          fileName: 'transcript.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
          documentType: 'TRANSCRIPT',
          description: 'Official transcript',
          uploadedBy: 'John Doe',
          uploadedAt: '2024-01-01T10:00:00.000Z',
        },
      },
    },
  })
  async findAll(
    @Query('documentType') documentType?: string,
    @Query('applicationId') applicationId?: string,
  ): Promise<DocumentResponseDto[]> {
    return this.documentsService.findAll({ documentType, applicationId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document metadata by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'Document metadata',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        fileName: 'transcript.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        documentType: 'TRANSCRIPT',
        description: 'Official transcript',
        uploadedBy: 'John Doe',
        uploadedAt: '2024-01-01T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findOne(@Param('id') id: string): Promise<DocumentResponseDto> {
    return this.documentsService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'Document file',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const { document, fileBuffer } = await this.documentsService.download(id);
    
    // Set appropriate headers for file download
    res.set({
      'Content-Type': document.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${document.fileName}"`,
      'Content-Length': fileBuffer.length.toString(),
    });
    
    return new StreamableFile(fileBuffer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 204, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete document' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.documentsService.remove(id);
  }
}
