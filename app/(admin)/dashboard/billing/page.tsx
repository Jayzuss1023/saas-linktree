import { PricingTable } from "@clerk/nextjs";

function BillingPage() {
  return (
    <div className="text-3xl font-bold mb-10 text-center md:text-left">
      <h1>Manage Your Billing</h1>

      <PricingTable />
    </div>
  );
}

export default BillingPage;
