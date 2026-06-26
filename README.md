# PDFSign Backend

Backend API for PDFSign, an online document signing platform that allows users to upload PDF files, place signatures, and download signed documents securely.

## Features

* User Authentication
* OTP-based Password Reset using Resend
* PDF Upload and Storage with Cloudinary
* Signature Placement on PDFs
* PDF Modification using pdf-lib
* Secure API Endpoints
* File Management

## Tech Stack

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL (Supabase)
* Cloudinary
* Resend
* pdf-lib
* JWT Authentication
* Multer

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000

DATABASE_URL=your_database_url

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RESEND_API_KEY=your_resend_api_key

CLIENT_URL=http://localhost:3000
```

Start the development server:

```bash
npm run dev
```

## API Features

### Authentication

* User Registration
* User Login
* User Logout
* Forgot Password
* OTP Verification
* Password Reset

### PDF Management

* Upload PDF Files
* Store PDFs on Cloudinary
* Retrieve Uploaded PDFs
* Generate Shareable Links

### Signature Management

* Save Signature Metadata
* Place Signatures on PDF Pages
* Update PDFs with Signatures
* Download Signed PDFs

## Project Structure

```text
backend/
├── controllers/
├── middleware/
├── routes/
├── prisma/
├── utils/
├── uploads/
├── server.js
└── package.json
```

## Security

* Password Hashing
* JWT Authentication
* HTTP-only Cookies
* OTP Expiration Handling
* Protected Routes

## Deployment

The backend can be deployed on platforms such as:

* Render
* Railway
* VPS Servers

Make sure all environment variables are configured before deployment.

## Environment Variables

| Variable              | Description                  |
| --------------------- | ---------------------------- |
| DATABASE_URL          | PostgreSQL connection string |
| JWT_SECRET            | JWT signing secret           |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name        |
| CLOUDINARY_API_KEY    | Cloudinary API key           |
| CLOUDINARY_API_SECRET | Cloudinary API secret        |
| RESEND_API_KEY        | Resend API key               |
| CLIENT_URL            | Frontend URL                 |

## Author

Akash Kumar

Built for secure online PDF signing and document sharing.

