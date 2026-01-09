'use client';

import { useEffect, useRef } from 'react';

interface AdRendererProps {
    html: string;
    className?: string;
}

export function AdRenderer({ html, className = '' }: AdRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !html) return;

        // Clear previous content
        containerRef.current.innerHTML = '';

        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Move nodes to the real container, executing scripts
        Array.from(tempDiv.childNodes).forEach(node => {
            if (node.nodeName === 'SCRIPT') {
                const script = document.createElement('script');
                const sourceScript = node as HTMLScriptElement;

                if (sourceScript.src) {
                    script.src = sourceScript.src;
                }
                if (sourceScript.innerHTML) {
                    script.innerHTML = sourceScript.innerHTML;
                }

                // Copy attributes
                Array.from(sourceScript.attributes).forEach(attr => {
                    script.setAttribute(attr.name, attr.value);
                });

                containerRef.current?.appendChild(script);
            } else {
                containerRef.current?.appendChild(node.cloneNode(true));
            }
        });
    }, [html]);

    return <div ref={containerRef} className={className} />;
}
