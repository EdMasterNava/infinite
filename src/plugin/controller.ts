figma.showUI(__html__);
figma.ui.resize(300, 500);

figma.ui.onmessage = (msg) => {
  if (msg.type === 'generated-image') {
    const uint8Array = msg.uint8Array;
    const imageNode = figma.createImage(uint8Array);
    
    const node = figma.createRectangle();
    node.resize(600, 600);
    node.fills = [
      {
        type: 'IMAGE',
        imageHash: imageNode.hash,
        scaleMode: 'FILL'
      }
    ];
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);
    figma.ui.postMessage({
      type: 'generate-image',
      message: `Image Generated`,
    });
  }

  figma.closePlugin();
};
