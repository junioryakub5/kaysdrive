import Link from "next/link";
import { XCircle } from "lucide-react";

export const metadata = {
  title: "Order Cancelled | OBDPro Scanner",
};

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0A0F2C 0%, #0D1535 100%)" }}>
      <div className="text-center p-12">
        <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Order Cancelled</h1>
        <p className="text-white/70 mb-8 max-w-md mx-auto">
          Your order was cancelled. No payment has been taken. Feel free to browse our products and try again.
        </p>
        <Link href="/#products" className="btn-primary inline-flex">
          Back to Products
        </Link>
      </div>
    </div>
  );
}
