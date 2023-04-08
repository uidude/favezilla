import {Profile, User} from '@toolkit/core/api/User';
import {
  BaseModel,
  DeletedBy,
  Field,
  InverseField,
  Model,
  Ref,
  TString,
} from '@toolkit/data/DataStore';

// These are the fields that will be copied from the user type
// to the profile type that is visible to other users
export const PROFILE_FIELDS = ['pic', 'name'];

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
  @Field() user: Profile;
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
