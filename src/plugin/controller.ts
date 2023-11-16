figma.showUI(__html__);
figma.ui.resize(300, 500);

figma.ui.onmessage = (msg) => {
  // function base64ToUint8Array(base64String: string): Uint8Array | null {
  //   try {
  //     // Remove the data URL prefix if present
  //     const base64WithoutPrefix = base64String.replace(/^data:\w+\/\w+;base64,/, '');
  
  //     // Decode the base64 string using Buffer
  //     const buffer = Buffer.from(base64WithoutPrefix, 'base64');
  
  //     // Create a Uint8Array from the Buffer
  //     const uint8Array = new Uint8Array(buffer);
  
  //     return uint8Array;
  //   } catch (error) {
  //     console.error('Error converting base64 to Uint8Array:', error.message);
  //     return null;
  //   }
  // }
  if (msg.type === 'generated-image') {
    console.log(msg)
    const uint8Array = msg.uint8Array
    const imageNode = figma.createImage(uint8Array)
    
    const node = figma.createRectangle()
    node.resize(600, 600)
    // node.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
    node.fills = [
      {
        type: 'IMAGE',
        imageHash: imageNode.hash,
        scaleMode: 'FILL'
      }
    ]
    figma.currentPage.selection = [node]
    figma.viewport.scrollAndZoomIntoView([node]);
    // const nodes = [];
    // for (let i = 0; i < 5; i++) {
    //   const rect = figma.createRectangle();
    //   rect.x = i * 150;
    //   rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
    //   figma.currentPage.appendChild(rect);
    //   nodes.push(rect);
    // }

    // figma.currentPage.selection = nodes;
    // figma.viewport.scrollAndZoomIntoView(nodes);

    // This is how figma responds back to the ui
    figma.ui.postMessage({
      type: 'generate-image',
      message: `Image Generated`,
    });
  }

  figma.closePlugin();
};
