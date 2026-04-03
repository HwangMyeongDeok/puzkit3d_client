import ProductShowcaseInteractive from './ProductShowcaseInteractive';

export default function ProductShowcase() {
  return (
    <div className="flex w-full flex-col gap-8 px-4 md:flex-row md:items-start lg:px-0">
      <ProductShowcaseInteractive />
    </div>
  );
}
