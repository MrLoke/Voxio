declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default content;

  // export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}
