import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { Project } from '../../projects/entities/project.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export enum DocumentType {
  MANUAL = 'manual',
  WIRING_DIAGRAM = 'wiring_diagram',
  RECEIPT = 'receipt',
  INVOICE = 'invoice',
  DYNO_SHEET = 'dyno_sheet',
  ALIGNMENT_SPEC = 'alignment_spec',
  OTHER = 'other',
}

@Entity('media_assets')
export class MediaAsset extends TenantBaseEntity {
  @Column()
  filename: string;

  @Column()
  originalFilename: string;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  type: MediaType;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ type: 'int', default: 0 })
  fileSize: number;

  @Column()
  storageKey: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    nullable: true,
  })
  documentType: DocumentType;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    categoryId?: string;
    partId?: string;
    taskId?: string;
    laborItemId?: string;
    disassemblyStep?: number;
    location?: string;
  };

  @Column('uuid', { name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.media, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
