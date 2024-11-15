import { SubmitButton } from '@/app/components/dashboard/SubmitButtons';
import { PricingTable } from '@/app/components/shared/pricing';
import prisma from '@/app/utils/db';
import { requireUser } from '@/app/utils/requireUser';
import { stripe } from '@/app/utils/stripe';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

async function getData(userId: string) {
  const data = await prisma.subscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      status: true,
      User: {
        select: {
          customerId: true,
        },
      },
    },
  });

  return data;
}

export default async function PricingPage() {
  const user = await requireUser();
  const data = await getData(user.id);

  async function createCustomerPortal() {
    'use server';

    const session = await stripe.billingPortal.sessions.create({
      customer: data?.User?.customerId as string,
      return_url:
        process.env.NODE_ENV === 'production'
          ? 'https://blog-pro-blush.vercel.app/dashboard'
          : 'http://localhost:3000/dashboard',
    });

    return redirect(session.url);
  }

  if (data?.status === 'active') {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Subscription Management</CardTitle>
          <CardDescription>
            Manage your subscription, payment methods, and billing information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCustomerPortal}>
            <SubmitButton text="Manage Subscription" className="w-full" />
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <PricingTable />
    </div>
  );
}
