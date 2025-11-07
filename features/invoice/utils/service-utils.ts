import { Service } from '@/types/type';

export const createEmptyService = (): Service => ({
  id: 0,
  description: '',
  additionalDescription: '',
  quantity: 1,
  price: 0,
});

export const validateService = (service: Service): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  if (!service.description.trim()) {
    errors.description = 'شرح خدمات الزامی است';
  }

  if (!service.quantity || service.quantity <= 0) {
    errors.quantity = 'تعداد باید بیشتر از صفر باشد';
  }

  if (!service.price || service.price <= 0) {
    errors.price = 'قیمت باید بیشتر از صفر باشد';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const calculateServicesTotal = (services: Service[]): number =>
  services.reduce((total, service) => total + service.quantity * service.price, 0);
