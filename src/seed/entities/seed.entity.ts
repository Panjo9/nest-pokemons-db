import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SeedDocument = HydratedDocument<Seed>;

@Schema()
export class Seed {
  @Prop({
    unique: true,
    index: true,
  })
  no: number;

  @Prop({
    unique: true,
    index: true,
  })
  name: string;

  @Prop({
    unique: true,
  })
  url: string;
}

export const SeedSchema = SchemaFactory.createForClass(Seed);
