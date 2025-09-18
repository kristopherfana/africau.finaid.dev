import BeneficiariesPage from '@/features/dev-office/beneficiaries';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/dev-office/beneficiaries/')({
  component: BeneficiariesPage,
});