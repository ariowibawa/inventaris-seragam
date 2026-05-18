export default function Footer() {
  return (
    <footer className="mt-auto py-6 px-8 border-t border-border/50 text-center text-sm text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} Uniform Inventory Management System. All rights reserved.</p>
    </footer>
  );
}
