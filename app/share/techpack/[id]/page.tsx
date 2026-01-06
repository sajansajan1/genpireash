import { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id = params.id;

  // 🔥 Fetch the techpack data (replace with your real API)
  const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/techpack/${id}`, {
    cache: "no-store",
  }).then((res) => res.json());

  const productName = data?.tech_pack?.productName ?? "Genpire Product";
  const description = data?.product_description ?? "";
  const creatorName = data?.creator_name ?? "";
  const createdAt = data?.created_at ?? "";
  const image = data?.productImages?.front ?? "/default-og.jpg";
  console.log("image ==> ", image);

  return {
    title: productName,
    description,
    openGraph: {
      title: productName,
      description,
      url: `https://www.genpire.com/share/techpack/${id}`,
      type: "article",
      images: [
        {
          url: "https://genpire.com/genpireurl.png",
          width: 1200,
          height: 630,
          alt: productName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: productName,
      description,
      images: ["https://genpire.com/genpireurl.png"],
    },
  };
}

export default async function ShareRedirect({ params }: PageProps) {
  const id = params.id;

  // Fetch data server-side
  const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/techpack/${id}`, { cache: "no-store" }).then((res) =>
    res.json()
  );

  const productName = data?.tech_pack?.productName ?? "Genpire Product";
  const description = data?.product_description ?? "";
  const image = data?.productImages?.front ?? "/default-og.jpg";

  return (
    <html lang="en">
      <head>
        <meta property="og:title" content={productName} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={`https://www.genpire.com/share/techpack/${id}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={productName} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta httpEquiv="refresh" content={`0; url=https://www.genpire.com/product/${id}`} />
      </head>
      <body>Redirecting...</body>
    </html>
  );
}
