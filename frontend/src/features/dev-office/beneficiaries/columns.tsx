
import { ColumnDef } from '@tanstack/react-table';

export type Beneficiary = {
  id: string;
  name: string;
  email: string;
  scholarships: {
    id: string;
    name: string;
    amount: number;
    status: string;
  }[];
};

export const columns: ColumnDef<Beneficiary>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'scholarships',
    header: 'Scholarships',
    cell: ({ row }) => {
      const scholarships = row.original.scholarships;
      return (
        <div>
          {scholarships.map(s => (
            <div key={s.id}>
              {s.name} (${s.amount})
            </div>
          ))}
        </div>
      );
    },
  },
];
