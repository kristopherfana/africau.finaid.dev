import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Express } from 'express';
import { DocumentResponseDto } from './dto/document-response.dto';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

@Injectable()
export class DocumentsService {
  // Mock data - replace with actual database implementation
  private documents: DocumentResponseDto[] = [];
  private readonly uploadsPath = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsPath)) {
      fs.mkdirSync(this.uploadsPath, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, documentType: string, description?: string): Promise<DocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedTypes = ['TRANSCRIPT', 'RECOMMENDATION', 'ID', 'PROOF_OF_INCOME', 'OTHER'];
    if (!allowedTypes.includes(documentType)) {
      throw new BadRequestException('Invalid document type');
    }

    // Generate unique filename to avoid conflicts
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExtension}`;
    const filePath = path.join(this.uploadsPath, uniqueFilename);

    try {
      // Save file to disk
      await fs.promises.writeFile(filePath, file.buffer);

      const document: DocumentResponseDto = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        documentType,
        description,
        uploadedBy: 'Current User', // Mock - should get from JWT
        uploadedAt: new Date(),
        filePath: uniqueFilename, // Store the unique filename for retrieval
      };

      this.documents.push(document);
      return document;
    } catch (error) {
      throw new BadRequestException(`Failed to save file: ${error.message}`);
    }
  }

  async uploadMultiple(files: Express.Multer.File[]): Promise<DocumentResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadedDocuments: DocumentResponseDto[] = [];
    
    for (const file of files) {
      const document: DocumentResponseDto = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        documentType: 'OTHER', // Default type for multiple uploads
        uploadedBy: 'Current User', // Mock - should get from JWT
        uploadedAt: new Date(),
      };
      
      this.documents.push(document);
      uploadedDocuments.push(document);
    }

    return uploadedDocuments;
  }

  async findAll(filters: { documentType?: string; applicationId?: string }): Promise<DocumentResponseDto[]> {
    let filtered = [...this.documents];

    if (filters.documentType) {
      filtered = filtered.filter(doc => doc.documentType === filters.documentType);
    }

    if (filters.applicationId) {
      filtered = filtered.filter(doc => doc.applicationId === filters.applicationId);
    }

    return filtered;
  }

  async findOne(id: string): Promise<DocumentResponseDto> {
    const document = this.documents.find(doc => doc.id === id);
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async download(id: string): Promise<{ document: DocumentResponseDto; fileBuffer: Buffer }> {
    const document = await this.findOne(id);
    
    if (!document.filePath) {
      throw new NotFoundException('File not found on disk');
    }
    
    try {
      const fullPath = path.join(this.uploadsPath, document.filePath);
      const fileBuffer = await fs.promises.readFile(fullPath);
      return { document, fileBuffer };
    } catch (error) {
      throw new NotFoundException(`File not found: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    
    const document = this.documents[index];
    
    // Delete file from disk if it exists
    if (document.filePath) {
      try {
        const fullPath = path.join(this.uploadsPath, document.filePath);
        await fs.promises.unlink(fullPath);
      } catch (error) {
        console.error(`Failed to delete file ${document.filePath}:`, error.message);
        // Continue with document removal even if file deletion fails
      }
    }
    
    this.documents.splice(index, 1);
  }
}
