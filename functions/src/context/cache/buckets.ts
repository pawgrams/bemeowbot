import { Storage, Bucket } from '@google-cloud/storage';

const storage: Storage = new Storage();

export const dbBucket: Bucket = storage.bucket('placeholder');
export const dbBucketPath: string = `https://storage.googleapis.com/${dbBucket.name}/`

export const publicBucket: Bucket = storage.bucket('placeholder');
export const publicBucketPath: string = `https://storage.googleapis.com/${publicBucket.name}/`

export const marketingBucket: Bucket = storage.bucket('placeholder');
export const marketingBucketPath: string = `https://storage.googleapis.com/${publicBucket.name}/`

