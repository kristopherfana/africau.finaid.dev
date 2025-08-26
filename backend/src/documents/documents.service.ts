import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Express } from 'express';
import { DocumentResponseDto } from './dto/document-response.dto';

@Injectable()
export class DocumentsService {
  // Mock data - replace with actual database implementation
  private documents: DocumentResponseDto[] = [];

  async upload(file: Express.Multer.File, documentType: string, description?: string): Promise<DocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedTypes = ['TRANSCRIPT', 'RECOMMENDATION', 'ID', 'PROOF_OF_INCOME', 'OTHER'];
    if (!allowedTypes.includes(documentType)) {
      throw new BadRequestException('Invalid document type');
    }

    const document: DocumentResponseDto = {
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      documentType,
      description,
      uploadedBy: 'Current User', // Mock - should get from JWT
      uploadedAt: new Date(),
    };

    this.documents.push(document);
    return document;
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
    
    // Mock file buffer - in real implementation, retrieve from storage
    const fileBuffer = Buffer.from('Mock file content');
    
    return { document, fileBuffer };
  }

  async remove(id: string): Promise<void> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    
    this.documents.splice(index, 1);
  }
}
