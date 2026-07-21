export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // format ISO "YYYY-MM-DD"
  createdAt?: string;
  updatedAt?: string;
}