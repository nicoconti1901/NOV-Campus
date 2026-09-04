import Image from "next/image";

type Props = {
  imageSrc: string;
  imageAlt: string;
  overlay: string;
  children: React.ReactNode;
};

export function LoginStage({ imageSrc, imageAlt, overlay, children }: Props) {
  return (
    <div className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 -z-10">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="login-kenburns object-cover"
        />
        <div className={`absolute inset-0 ${overlay}`} />
      </div>
      {children}
    </div>
  );
}
