-- Create Inventory Tables
-- This script creates the necessary tables for inventory management

-- Create warehouses table
CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `location` VARCHAR(191) NULL,
  `type` VARCHAR(191) NOT NULL DEFAULT 'main',
  `capacity` INT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `companyId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `warehouses_companyId_idx` (`companyId`),
  CONSTRAINT `warehouses_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create inventory table
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `warehouseId` VARCHAR(191) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `reserved` INT NOT NULL DEFAULT 0,
  `available` INT NOT NULL DEFAULT 0,
  `minStock` INT NOT NULL DEFAULT 0,
  `maxStock` INT NULL,
  `reorderPoint` INT NOT NULL DEFAULT 0,
  `reorderQuantity` INT NOT NULL DEFAULT 0,
  `cost` DECIMAL(10,2) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `inventory_productId_warehouseId_key` (`productId`, `warehouseId`),
  INDEX `inventory_productId_idx` (`productId`),
  INDEX `inventory_warehouseId_idx` (`warehouseId`),
  CONSTRAINT `inventory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inventory_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `warehouseId` VARCHAR(191) NOT NULL,
  `type` ENUM('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER', 'RETURN') NOT NULL,
  `reason` ENUM('PURCHASE', 'SALE', 'DAMAGE', 'EXPIRED', 'LOST', 'FOUND', 'TRANSFER', 'RETURN', 'ADJUSTMENT') NOT NULL,
  `quantity` INT NOT NULL,
  `cost` DECIMAL(10,2) NULL,
  `reference` VARCHAR(191) NULL,
  `notes` TEXT NULL,
  `userId` VARCHAR(191) NULL,
  `userName` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `stock_movements_productId_idx` (`productId`),
  INDEX `stock_movements_warehouseId_idx` (`warehouseId`),
  INDEX `stock_movements_createdAt_idx` (`createdAt`),
  CONSTRAINT `stock_movements_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stock_movements_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create stock_alerts table
CREATE TABLE IF NOT EXISTS `stock_alerts` (
  `id` VARCHAR(191) NOT NULL,
  `type` ENUM('LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'EXPIRY_WARNING') NOT NULL,
  `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `productName` VARCHAR(191) NOT NULL,
  `warehouseId` VARCHAR(191) NOT NULL,
  `warehouseName` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `currentStock` INT NULL,
  `reorderPoint` INT NULL,
  `reorderQuantity` INT NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `stock_alerts_productId_idx` (`productId`),
  INDEX `stock_alerts_warehouseId_idx` (`warehouseId`),
  INDEX `stock_alerts_isRead_idx` (`isRead`),
  INDEX `stock_alerts_priority_idx` (`priority`),
  CONSTRAINT `stock_alerts_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stock_alerts_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert sample warehouses
INSERT IGNORE INTO `warehouses` (`id`, `name`, `location`, `type`, `capacity`, `isActive`, `companyId`, `createdAt`, `updatedAt`) 
SELECT 
  'WH001' as id,
  'المستودع الرئيسي' as name,
  'الرياض - حي الصناعية' as location,
  'main' as type,
  10000 as capacity,
  true as isActive,
  c.id as companyId,
  NOW() as createdAt,
  NOW() as updatedAt
FROM `companies` c 
LIMIT 1;

INSERT IGNORE INTO `warehouses` (`id`, `name`, `location`, `type`, `capacity`, `isActive`, `companyId`, `createdAt`, `updatedAt`) 
SELECT 
  'WH002' as id,
  'مستودع جدة' as name,
  'جدة - المنطقة الصناعية' as location,
  'branch' as type,
  5000 as capacity,
  true as isActive,
  c.id as companyId,
  NOW() as createdAt,
  NOW() as updatedAt
FROM `companies` c 
LIMIT 1;

-- Insert sample inventory for existing products
INSERT IGNORE INTO `inventory` (`id`, `productId`, `warehouseId`, `quantity`, `reserved`, `available`, `minStock`, `reorderPoint`, `reorderQuantity`, `cost`, `createdAt`, `updatedAt`)
SELECT 
  CONCAT('INV_', p.id, '_', w.id) as id,
  p.id as productId,
  w.id as warehouseId,
  FLOOR(RAND() * 100) + 10 as quantity,
  FLOOR(RAND() * 5) as reserved,
  FLOOR(RAND() * 100) + 5 as available,
  10 as minStock,
  20 as reorderPoint,
  50 as reorderQuantity,
  COALESCE(p.cost, 0) as cost,
  NOW() as createdAt,
  NOW() as updatedAt
FROM `products` p
CROSS JOIN `warehouses` w
WHERE NOT EXISTS (
  SELECT 1 FROM `inventory` i 
  WHERE i.productId = p.id AND i.warehouseId = w.id
);

-- Update available quantities based on quantity - reserved
UPDATE `inventory` SET `available` = `quantity` - `reserved` WHERE `available` != (`quantity` - `reserved`);

SELECT 'Inventory tables created successfully!' as message;
