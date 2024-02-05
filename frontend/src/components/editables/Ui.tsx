import initSwc, { transform } from '@swc/wasm-web';
import React, { useEffect, useState, ReactNode } from 'react';
import Frame from 'react-frame-component';

const code = `const Component = () => {
  return <h2>Hi, I am a Car! {window.document.title}</h2>;
}
`;

export const UI = () => {
  const [isInit, setIsInit] = useState(false);
  const [result, setResult] = useState<ReactNode | null>(null);

  useEffect(() => {
    const init = async () => {
      await initSwc();
      setIsInit(true);
    };

    init();
  }, []);

  useEffect(() => {
    const transpile = async () => {
      const res = await transform(code, {
        jsc: { parser: { syntax: 'typescript', tsx: true } },
      });

      const finalCode = `${res.code}\n\nreturn Component;`;

      console.log(finalCode);

      const sandboxed = new Function('React', finalCode);
      setResult(sandboxed(React));
      console.log(sandboxed);
    };

    if (isInit) {
      transpile();
    }
  }, [isInit]);

  return (
    <div>
      <Frame>{result ? result : 'uiyarn de'}</Frame>
    </div>
  );
};
