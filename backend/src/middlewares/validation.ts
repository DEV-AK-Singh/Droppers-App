import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express'; 

export const validateOrderCreation = [
  body('pickupAddress')
    .notEmpty()
    .trim()
    .withMessage('Pickup address is required')
    .isLength({ min: 10 })
    .withMessage('Pickup address must be at least 10 characters long'),
  
  body('deliveryAddress')
    .notEmpty()
    .trim()
    .withMessage('Delivery address is required')
    .isLength({ min: 10 })
    .withMessage('Delivery address must be at least 10 characters long'),
  
  body('customerName')
    .notEmpty()
    .trim()
    .withMessage('Customer name is required')
    .isLength({ min: 2 })
    .withMessage('Customer name must be at least 2 characters long'),
  
  body('customerPhone')
    .notEmpty()
    .trim()
    .withMessage('Customer phone is required')
    .matches(/^\+?[\d\s-()]{10,}$/)
    .withMessage('Please enter a valid phone number'),
  
  body('itemDescription')
    .notEmpty()
    .trim()
    .withMessage('Item description is required')
    .isLength({ min: 5 })
    .withMessage('Item description must be at least 5 characters long'),
  
  body('orderValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Order value must be a positive number'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
]; 