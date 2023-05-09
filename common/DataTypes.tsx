import {User} from '@toolkit/core/api/User';
import {type Opt} from '@toolkit/core/util/Types';
import {
  BaseModel,
  DeletedBy,
  Field,
  InverseField,
  Model,
  Ref,
  TString,
} from '@toolkit/data/DataStore';

@Model({name: 'profile'})
export class Profile extends BaseModel {
  @Field() user: User;
  @Field() name: string;
  @Field(TString) pic?: Opt<string>;
  @Field(TString) about?: Opt<string>;
  @InverseField() faves?: Fave[];
}

export type ThingType = 'book';
export type ExternalType = 'openlibrary';
@Model({name: 'things'})
export class Thing extends BaseModel {
  @Field() name: string;
  @Field() description: string;
  @Field(TString) type: ThingType;
  @Field() image: string;
  @Field() thumb: string;
  @Field(TString) externalId?: string;
  @Field(TString) externalType?: ExternalType;
  @InverseField() faves: Fave[];
}

@Model({name: 'faves'})
@DeletedBy(Ref('user'), Ref('thing'))
export class Fave extends BaseModel {
  @Field({inverse: {field: 'faves', many: true}}) user: Profile;
  @Field({inverse: {field: 'faves', many: true}}) thing: Thing;
}

export type TagType = 'library' | 'ignored';

/**
 * Per-user private tags
 * library = user has read or is reading (and future will be watched / is watching
 * ignored = user saw this in a list and doesn't want to be asked about it again
 */
@Model({name: 'tags'})
@DeletedBy(Ref('user'), Ref('thing'))
export class Tags extends BaseModel {
  @Field() user: User;
  @Field() thing: Thing;
  @Field(TString) type: TagType;
}
