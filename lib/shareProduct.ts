export interface ShareDataProps {
  title: string;
  description?: string;
  createdAt?: string | Date;
  creatorName?: string;
  imageUrl?: string;
  productUrl: string;
}

const buildShareText = ({ title, description, createdAt, creatorName }: ShareDataProps): string => {
  const createdDate = createdAt ? new Date(createdAt).toLocaleDateString("en-GB") : "";

  const baseMessage = `I just created this product on Genpire — check it out!`;

  return `${baseMessage} ${title}${description ? " — " + description : ""}${
    createdDate ? " \nCreated: " + createdDate : ""
  }${creatorName ? " \nBy: " + creatorName : ""}`;
};

const openPopup = (url: string) => {
  if (typeof window !== "undefined") {
    window.open(
      url,
      "Share",
      "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=640,height=480"
    );
  }
};

export const shareToX = (data: ShareDataProps): void => {
  const shareText = buildShareText(data);

  const encodedText = encodeURIComponent(shareText);
  const encodedURL = encodeURIComponent(data.productUrl);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedURL}`;

  openPopup(twitterUrl);
};

export const shareToFacebook = (data: ShareDataProps): void => {
  console.log("data ==> ", data);
  const shareText = buildShareText(data);

  const encodedText = encodeURIComponent(shareText);
  const encodedURL = encodeURIComponent(data.productUrl);

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}&quote=${encodedText}`;

  openPopup(facebookUrl);
};
