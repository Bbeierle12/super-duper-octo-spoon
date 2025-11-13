import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MediaAsset, MediaType } from './entities/media-asset.entity';
import { RequestUploadDto, CompleteUploadDto } from './dto/request-upload.dto';
import * as crypto from 'crypto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'video/mp4',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaAsset)
    private mediaRepository: Repository<MediaAsset>,
    private configService: ConfigService,
  ) {}

  async findByProject(tenantId: string, projectId: string): Promise<MediaAsset[]> {
    return this.mediaRepository.find({
      where: { tenantId, projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async requestUpload(tenantId: string, userId: string, dto: RequestUploadDto) {
    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(dto.mimeType)) {
      throw new BadRequestException('File type not allowed');
    }

    // Generate unique storage key
    const uploadId = crypto.randomUUID();
    const extension = this.getFileExtension(dto.filename);
    const storageKey = `${tenantId}/${dto.projectId}/${uploadId}${extension}`;

    // In production, you would generate a signed URL to S3 here
    // For now, return a mock upload URL
    const uploadUrl = this.generateUploadUrl(storageKey);

    return {
      uploadId,
      uploadUrl,
      storageKey,
      expiresIn: 3600, // 1 hour
    };
  }

  async completeUpload(
    tenantId: string,
    userId: string,
    projectId: string,
    dto: CompleteUploadDto,
  ): Promise<MediaAsset> {
    // Create media asset record
    const mediaAsset = this.mediaRepository.create({
      tenantId,
      projectId,
      filename: dto.uploadId,
      originalFilename: dto.uploadId,
      storageKey: dto.storageKey,
      url: this.generateAccessUrl(dto.storageKey),
      description: dto.description,
      tags: dto.tags,
      type: MediaType.IMAGE, // Would be determined from actual upload
    });

    return this.mediaRepository.save(mediaAsset);
  }

  private generateUploadUrl(storageKey: string): string {
    // In production, use AWS SDK to generate signed URL:
    // const s3 = new AWS.S3();
    // return s3.getSignedUrl('putObject', {
    //   Bucket: this.configService.get('S3_BUCKET_NAME'),
    //   Key: storageKey,
    //   Expires: 3600,
    // });

    // Mock URL for development
    return `https://storage.example.com/upload/${storageKey}`;
  }

  private generateAccessUrl(storageKey: string): string {
    // In production, use AWS SDK to generate signed URL:
    // const s3 = new AWS.S3();
    // return s3.getSignedUrl('getObject', {
    //   Bucket: this.configService.get('S3_BUCKET_NAME'),
    //   Key: storageKey,
    //   Expires: 3600,
    // });

    // Mock URL for development
    return `https://storage.example.com/${storageKey}`;
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
  }
}
