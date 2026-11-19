import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'p4abpsol',
  api_key: process.env.CLOUDINARY_API_KEY || '199842741455217',
  api_secret: process.env.CLOUDINARY_API_SECRET || '30NmDv_fK5TZHQqfSDtG4HJoTpw',
  secure: true,
});

export default cloudinary;
