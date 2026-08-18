import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata = {
  title: "Order Confirmed | OBDPro Scanner",
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0A0F2C 0%, #0D1535 100%)" }}>
      <div className="text-center p-12">
        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Order Confirmed!</h1>
        <p className="text-white/70 mb-8 max-w-md mx-auto">
          Thank you for your purchase! Your OBDPro Scanner is on its way. You'll receive a confirmation email shortly.
        </p>
        <Link href="/" className="btn-primary inline-flex">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
