# Bill Management Service

## Overview

The Bill Management Service is the core of the FairShare application. It handles bill uploads, OCR processing, item extraction, bill splitting logic, contribution tracking, and payment status management.

## Port

**3002** - Bill Management service endpoint

## Tech Stack

- **Framework**: NestJS
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **OCR Processing**: Tesseract.js / Google Vision API
- **File Upload**: Multer
- **Image Processing**: Sharp
- **Validation**: class-validator, class-transformer
- **Language**: TypeScript
- **Runtime**: Node.js

## Responsibilities

1. **Bill Upload & Processing** - Handle image uploads and OCR extraction
2. **Item Management** - Extract and manage bill items
3. **Bill Splitting** - Calculate fair splits based on percentages or fixed amounts
4. **Contribution Tracking** - Track who owes what for each bill
5. **Payment Management** - Toggle payment status for contributions
6. **Tax Calculation** - Proportionally distribute taxes across items

## API Routes

### 1. Upload Bill
```
POST /api/bills/upload
```

**Purpose**: Upload bill image, extract items using OCR, create bill entry

**Request** (multipart/form-data):
```
file: <image file> (jpg, png, pdf)
userId: <uuid>
groupId: <uuid> (optional)
```

**Response** (201 Created):
```json
{
  "bill": {
    "id": "bill-uuid",
    "userId": "user-uuid",
    "imageUrl": "https://storage.../bill.jpg",
    "totalAmount": 125.50,
    "tax": 12.50,
    "subtotal": 113.00,
    "createdAt": "2026-03-07T07:43:00.000Z"
  },
  "items": [
    {
      "id": "item-uuid-1",
      "billId": "bill-uuid",
      "name": "Pizza Margherita",
      "quantity": 2,
      "unitPrice": 15.00,
      "totalPrice": 30.00
    },
    {
      "id": "item-uuid-2",
      "billId": "bill-uuid",
      "name": "Coca Cola",
      "quantity": 3,
      "unitPrice": 3.00,
      "totalPrice": 9.00
    }
  ]
}
```

**OCR Processing Flow**:
1. Upload image to storage
2. Process image with OCR
3. Extract items, quantities, prices
4. Calculate totals and tax
5. Create bill and items in database

**Error Responses**:
- `400 Bad Request`: Invalid file format
- `413 Payload Too Large`: File size exceeds limit
- `422 Unprocessable Entity`: OCR extraction failed

---

### 2. Assign Bill Items/Shares
```
POST /api/bills/:billId/assign
```

**Purpose**: Assign bill items or percentage shares to users with proportional tax calculation

**Request Body**:
```json
{
  "assignments": [
    {
      "userId": "user-uuid-1",
      "items": ["item-uuid-1"],
      "percentage": null
    },
    {
      "userId": "user-uuid-2",
      "items": ["item-uuid-2"],
      "percentage": null
    },
    {
      "userId": "user-uuid-3",
      "items": [],
      "percentage": 30
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "contributions": [
    {
      "id": "contrib-uuid-1",
      "billId": "bill-uuid",
      "userId": "user-uuid-1",
      "amount": 33.10,
      "taxAmount": 3.10,
      "isPaid": false,
      "items": ["Pizza Margherita x2"]
    },
    {
      "id": "contrib-uuid-2",
      "billId": "bill-uuid",
      "userId": "user-uuid-2",
      "amount": 9.90,
      "taxAmount": 0.90,
      "isPaid": false,
      "items": ["Coca Cola x3"]
    },
    {
      "id": "contrib-uuid-3",
      "billId": "bill-uuid",
      "userId": "user-uuid-3",
      "amount": 37.65,
      "taxAmount": 3.75,
      "isPaid": false,
      "percentage": 30
    }
  ]
}
```

**Tax Calculation Logic**:
```typescript
// Proportional tax distribution
const itemTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
const taxRatio = bill.tax / bill.subtotal;
const contributionTax = itemTotal * taxRatio;
const totalContribution = itemTotal + contributionTax;
```

**Error Responses**:
- `404 Not Found`: Bill not found
- `400 Bad Request`: Invalid assignment data
- `409 Conflict`: Items already assigned

---

### 3. Toggle Payment Status
```
PATCH /api/contributions/:id/toggle-paid
```

**Purpose**: Mark contribution as paid or unpaid

**Request Body**:
```json
{
  "isPaid": true
}
```

**Response** (200 OK):
```json
{
  "id": "contrib-uuid",
  "billId": "bill-uuid",
  "userId": "user-uuid",
  "amount": 33.10,
  "isPaid": true,
  "paidAt": "2026-03-07T08:00:00.000Z"
}
```

**Side Effects**:
- Updates contribution status
- Triggers analytics refresh
- Sends notification (future)

**Error Responses**:
- `404 Not Found`: Contribution not found
- `403 Forbidden`: Not authorized to update

---

### 4. Get Bill Details
```
GET /api/bills/:id
```

**Purpose**: Retrieve complete bill information with items and contributions

**Response** (200 OK):
```json
{
  "id": "bill-uuid",
  "userId": "user-uuid",
  "imageUrl": "https://storage.../bill.jpg",
  "totalAmount": 125.50,
  "tax": 12.50,
  "subtotal": 113.00,
  "createdAt": "2026-03-07T07:43:00.000Z",
  "items": [
    {
      "id": "item-uuid-1",
      "name": "Pizza Margherita",
      "quantity": 2,
      "unitPrice": 15.00,
      "totalPrice": 30.00
    }
  ],
  "contributions": [
    {
      "id": "contrib-uuid-1",
      "userId": "user-uuid-1",
      "userName": "John Doe",
      "amount": 33.10,
      "isPaid": false
    }
  ],
  "summary": {
    "totalPaid": 42.00,
    "totalPending": 83.50,
    "paidPercentage": 33.47
  }
}
```

**Error Responses**:
- `404 Not Found`: Bill not found
- `403 Forbidden`: Not authorized to view

---

### 5. Delete Bill
```
DELETE /api/bills/:id
```

**Purpose**: Soft-delete bill (marks as deleted, maintains data integrity)

**Response** (200 OK):
```json
{
  "message": "Bill deleted successfully",
  "billId": "bill-uuid",
  "deletedAt": "2026-03-07T08:00:00.000Z"
}
```

**Soft Delete Logic**:
- Sets `deletedAt` timestamp
- Does not remove from database
- Excluded from queries by default
- Can be restored if needed

**Error Responses**:
- `404 Not Found`: Bill not found
- `403 Forbidden`: Not authorized to delete

---

## Database Schema (Drizzle ORM)

### Bills Table

```typescript
export const bills = pgTable('bills', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  imageUrl: varchar('image_url', { length: 500 }),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
```

### Bill Items Table

```typescript
export const billItems = pgTable('bill_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  billId: uuid('bill_id').notNull().references(() => bills.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Contributions Table

```typescript
export const contributions = pgTable('contributions', {
  id: uuid('id').defaultRandom().primaryKey(),
  billId: uuid('bill_id').notNull().references(() => bills.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
  percentage: decimal('percentage', { precision: 5, scale: 2 }),
  isPaid: boolean('is_paid').default(false),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Contribution Items (Junction Table)

```typescript
export const contributionItems = pgTable('contribution_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  contributionId: uuid('contribution_id').notNull().references(() => contributions.id, { onDelete: 'cascade' }),
  billItemId: uuid('bill_item_id').notNull().references(() => billItems.id, { onDelete: 'cascade' }),
});
```

**Indexes**:
- `bills.userId` - Fast user bill lookups
- `contributions.billId` - Fast contribution queries
- `contributions.userId` - User contribution history
- `billItems.billId` - Bill items retrieval

---

## Implementation Guide

### 1. Project Structure

```
apps/bill-management/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── bills/
│   │   ├── bills.module.ts
│   │   ├── bills.controller.ts
│   │   ├── bills.service.ts
│   │   ├── bills.repository.ts
│   │   └── dto/
│   │       ├── upload-bill.dto.ts
│   │       └── assign-bill.dto.ts
│   ├── items/
│   │   ├── items.service.ts
│   │   └── items.repository.ts
│   ├── contributions/
│   │   ├── contributions.module.ts
│   │   ├── contributions.controller.ts
│   │   ├── contributions.service.ts
│   │   └── contributions.repository.ts
│   ├── ocr/
│   │   ├── ocr.module.ts
│   │   ├── ocr.service.ts
│   │   └── processors/
│   │       ├── tesseract.processor.ts
│   │       └── vision-api.processor.ts
│   ├── storage/
│   │   ├── storage.module.ts
│   │   └── storage.service.ts
│   └── database/
│       ├── schema.ts
│       └── migrations/
└── README.md
```

### 2. Dependencies Installation

```bash
npm install drizzle-orm pg
npm install @nestjs/platform-express multer sharp
npm install tesseract.js
npm install @google-cloud/vision  # Optional
npm install -D @types/multer @types/sharp drizzle-kit
```

### 3. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fairshare_bills
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=fairshare_bills

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Storage
STORAGE_TYPE=local  # local, s3, gcs
STORAGE_PATH=./uploads
S3_BUCKET=fairshare-bills
S3_REGION=us-east-1

# OCR
OCR_PROVIDER=tesseract  # tesseract, google-vision
GOOGLE_VISION_API_KEY=your-api-key

# Service
PORT=3002
NODE_ENV=development
```

### 4. OCR Service Implementation

**ocr.service.ts**:
```typescript
import { Injectable } from '@nestjs/common';
import Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
  async extractTextFromImage(imagePath: string): Promise<string> {
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng',
      { logger: m => console.log(m) }
    );
    return text;
  }

  parseReceiptText(text: string): ParsedReceipt {
    // Parse extracted text to identify:
    // - Items and prices
    // - Quantities
    // - Subtotal, tax, total
    // This requires pattern matching and NLP
    
    const lines = text.split('\n');
    const items = [];
    let total = 0;
    let tax = 0;
    
    // Pattern matching logic here
    // Example: /(\d+)\s+(.+?)\s+\$?(\d+\.\d{2})/
    
    return { items, total, tax };
  }
}
```

### 5. Bill Assignment Logic

**bills.service.ts**:
```typescript
async assignBill(billId: string, assignments: AssignmentDto[]) {
  const bill = await this.billsRepository.findById(billId);
  const contributions = [];

  for (const assignment of assignments) {
    let amount = 0;
    let taxAmount = 0;

    if (assignment.items && assignment.items.length > 0) {
      // Item-based assignment
      const items = await this.itemsRepository.findByIds(assignment.items);
      const itemTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      // Proportional tax calculation
      const taxRatio = bill.tax / bill.subtotal;
      taxAmount = itemTotal * taxRatio;
      amount = itemTotal + taxAmount;
    } else if (assignment.percentage) {
      // Percentage-based assignment
      amount = (bill.totalAmount * assignment.percentage) / 100;
      taxAmount = (bill.tax * assignment.percentage) / 100;
    }

    const contribution = await this.contributionsRepository.create({
      billId,
      userId: assignment.userId,
      amount,
      taxAmount,
      percentage: assignment.percentage,
      isPaid: false,
    });

    contributions.push(contribution);
  }

  return contributions;
}
```

## Running the Service

```bash
# Development
nx serve bill-management

# Production build
nx build bill-management

# Run migrations
npm run migration:run
```

## Testing

```bash
# Unit tests
nx test bill-management

# E2E tests
nx e2e bill-management-e2e

# Test bill upload
curl -X POST http://localhost:3002/upload \
  -F "file=@bill.jpg" \
  -F "userId=user-uuid"
```

## Performance Optimization

1. **Database Indexing**: Index on userId, billId for fast queries
2. **Image Optimization**: Compress images before storage using Sharp
3. **OCR Caching**: Cache OCR results to avoid reprocessing
4. **Batch Processing**: Process multiple bills asynchronously
5. **Connection Pooling**: PostgreSQL connection pool

## Security Considerations

1. **File Validation**: Validate file type and size
2. **Virus Scanning**: Scan uploaded files (ClamAV)
3. **Access Control**: Verify user owns bill before operations
4. **SQL Injection**: Drizzle ORM prevents SQL injection
5. **Input Sanitization**: Sanitize OCR extracted text

## Future Enhancements

1. ⏳ Receipt scanning improvements (ML model)
2. ⏳ Multiple currency support
3. ⏳ Bill templates for recurring expenses
4. ⏳ Group bill management
5. ⏳ Export bills to PDF/CSV
6. ⏳ Bill reminders and notifications
7. ⏳ Integration with payment gateways

## Related Documentation

- [Gateway Service](../gateway/README.md)
- [Authentication Service](../authentication/README.md)
- [Analytics Service](../analytics/README.md)
