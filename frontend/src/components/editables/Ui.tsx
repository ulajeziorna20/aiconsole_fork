import { createSandbox } from '@/utils/transpilation/createSandbox';
import { transpileCode } from '@/utils/transpilation/transpileCode';
import { useEffect, useState, ReactNode } from 'react';

const code = `const Component = () => {
  return <h2>Hi, I am a Car! {window.document.title}</h2>;
}
`;

export const UI = () => {
  const [result, setResult] = useState<ReactNode | null>(null);

  useEffect(() => {
    const transpile = async () => {
      const finalCode = await transpileCode(code);

      const sandboxed = createSandbox(finalCode);

      if (sandboxed) {
        setResult(sandboxed());
      }
    };

    transpile();
  }, []);

  return <div>{result ? result : 'ui'}</div>;
};
