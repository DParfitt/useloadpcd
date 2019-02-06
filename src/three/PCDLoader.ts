import * as THREE from 'three';

class PCDLoader extends THREE.Loader {
  public manager?: THREE.LoadingManager;
  public littleEndian: boolean;
  public path: string;
  constructor(manager?: THREE.LoadingManager) {
    super();
    this.manager =
      manager !== undefined ? manager : THREE.DefaultLoadingManager;
    this.littleEndian = true;
    this.path = '';
  }

  public load(
    url: string,
    onLoad: (data: any) => void,
    onProgress: (request: ProgressEvent) => void,
    onError: (event: ErrorEvent) => void
  ) {
    const loader = new THREE.FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');
    loader.load(
      url,
      data => {
        try {
          onLoad(this.parse(data, url));
        } catch (e) {
          if (onError) {
            onError(e);
          } else {
            throw e;
          }
        }
      },
      onProgress,
      onError
    );
  }

  public setPath(value: string) {
    this.path = value;
    return this;
  }

  public parse(data: any, url: string) {
    const parseHeader = (headerData: string) => {
      const header: any = {};
      const result1 = headerData.search(/[\r\n]DATA\s(\S*)\s/i);
      const result2: any = /[\r\n]DATA\s(\S*)\s/i.exec(
        headerData.substr(result1 - 1)
      );

      header.data = result2[1];
      header.headerLen = result2[0].length + result1;
      header.str = headerData.substr(0, header.headerLen);

      // remove comments

      header.str = header.str.replace(/\#.*/gi, '');

      // parse

      header.version = /VERSION (.*)/i.exec(header.str);
      header.fields = /FIELDS (.*)/i.exec(header.str);
      header.size = /SIZE (.*)/i.exec(header.str);
      header.type = /TYPE (.*)/i.exec(header.str);
      header.count = /COUNT (.*)/i.exec(header.str);
      header.width = /WIDTH (.*)/i.exec(header.str);
      header.height = /HEIGHT (.*)/i.exec(header.str);
      header.viewpoint = /VIEWPOINT (.*)/i.exec(header.str);
      header.points = /POINTS (.*)/i.exec(header.str);

      // evaluate

      if (header.version !== null) {
        header.version = parseFloat(header.version[1]);
      }

      if (header.fields !== null) header.fields = header.fields[1].split(' ');

      if (header.type !== null) header.type = header.type[1].split(' ');

      if (header.width !== null) header.width = parseInt(header.width[1], 10);

      if (header.height !== null) {
        header.height = parseInt(header.height[1], 10);
      }

      if (header.viewpoint !== null) header.viewpoint = header.viewpoint[1];

      if (header.points !== null) {
        header.points = parseInt(header.points[1], 10);
      }

      if (header.points === null) header.points = header.width * header.height;

      if (header.size !== null) {
        header.size = header.size[1].split(' ').map((x: string) => {
          return parseInt(x, 10);
        });
      }

      if (header.count !== null) {
        header.count = header.count[1].split(' ').map((x: string) => {
          return parseInt(x, 10);
        });
      } else {
        header.count = [];

        for (let iter = 0, l = header.fields.length; iter < l; iter += 1) {
          header.count.push(1);
        }
      }

      header.offset = {};

      let sizeSum = 0;

      for (let iter = 0, l = header.fields.length; iter < l; iter += 1) {
        if (header.data === 'ascii') {
          header.offset[header.fields[iter]] = iter;
        } else {
          header.offset[header.fields[iter]] = sizeSum;
          sizeSum += header.size[iter];
        }
      }

      // for binary only

      header.rowSize = sizeSum;

      return header;
    };

    const textData = THREE.LoaderUtils.decodeText(data);
    const pcdHeader = parseHeader(textData);

    const position = [];
    const normal = [];
    const color = [];

    if (pcdHeader.data === 'ascii') {
      const offset = pcdHeader.offset;
      const pcdData = textData.substr(pcdHeader.headerLen);
      const lines = pcdData.split('\n');

      for (let iter = 0, l = lines.length; iter < l; iter += 1) {
        if (lines[iter] === '') continue;

        const line = lines[iter].split(' ');
        if (offset.x !== undefined) {
          position.push(parseFloat(line[offset.x]));
          position.push(parseFloat(line[offset.y]));
          position.push(parseFloat(line[offset.z]));
        }

        if (offset.rgb !== undefined) {
          const rgb = parseFloat(line[offset.rgb]);
          const r = (rgb >> 16) & 0x0000ff;
          const g = (rgb >> 8) & 0x0000ff;
          const b = (rgb >> 0) & 0x0000ff;
          color.push(r / 255, g / 255, b / 255);
        }

        if (offset.normal_x !== undefined) {
          normal.push(parseFloat(line[offset.normal_x]));
          normal.push(parseFloat(line[offset.normal_y]));
          normal.push(parseFloat(line[offset.normal_z]));
        }
      }
    }

    if (pcdHeader.data === 'binary_compressed') {
      console.error(
        'THREE.PCDLoader: binary_compressed files are not supported'
      );
      return;
    }

    if (pcdHeader.data === 'binary') {
      const dataview = new DataView(data, pcdHeader.headerLen);
      const offset = pcdHeader.offset;

      for (
        let iter = 0, row = 0;
        iter < pcdHeader.points;
        iter += 1, row += pcdHeader.rowSize
      ) {
        if (offset.x !== undefined) {
          position.push(dataview.getFloat32(row + offset.x, this.littleEndian));
          position.push(dataview.getFloat32(row + offset.y, this.littleEndian));
          position.push(dataview.getFloat32(row + offset.z, this.littleEndian));
        }

        if (offset.rgb !== undefined) {
          color.push(dataview.getUint8(row + offset.rgb + 2) / 255.0);
          color.push(dataview.getUint8(row + offset.rgb + 1) / 255.0);
          color.push(dataview.getUint8(row + offset.rgb + 0) / 255.0);
        }

        if (offset.normal_x !== undefined) {
          normal.push(
            dataview.getFloat32(row + offset.normal_x, this.littleEndian)
          );
          normal.push(
            dataview.getFloat32(row + offset.normal_y, this.littleEndian)
          );
          normal.push(
            dataview.getFloat32(row + offset.normal_z, this.littleEndian)
          );
        }
      }
    }

    const geometry = new THREE.BufferGeometry();

    if (position.length > 0) {
      geometry.addAttribute(
        'position',
        new THREE.Float32BufferAttribute(position, 3)
      );
    }
    if (normal.length > 0) {
      geometry.addAttribute(
        'normal',
        new THREE.Float32BufferAttribute(normal, 3)
      );
    }
    if (color.length > 0) {
      geometry.addAttribute(
        'color',
        new THREE.Float32BufferAttribute(color, 3)
      );
    }

    geometry.computeBoundingSphere();

    // build material

    const material = new THREE.PointsMaterial({ size: 0.005 });

    if (color.length > 0) {
      material.vertexColors = THREE.VertexColors;
    } else {
      material.color.setHex(Math.random() * 0xffffff);
    }

    // build mesh

    const mesh = new THREE.Points(geometry, material);
    let name: string | RegExpExecArray = url
      .split('')
      .reverse()
      .join('');

    name = /([^\/]*)/.exec(name) as RegExpExecArray;

    name = name[1]
      .split('')
      .reverse()
      .join('');

    mesh.name = name;

    return mesh;
  }
}

export default PCDLoader;
