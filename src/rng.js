export class RNG {
  m_w = 123456789;
  m_z = 987654321;
  mask = 0xffffff;

  constructor(seed) {
    this.m_w = (this.m_w + seed) & this.mask;
    this.m_x = (this.m_z - seed) & this.mask;
  }

  random() {
    this.m_z = (36969 * (this.m_z & 65535) + (this.m_z >> 16)) & this.mask;
    this.m_w = (18000 * (this.m_w & 65535) + (this.m_w >> 16)) & this.mask;
    let result = ((this.m_z << 16) + (this.m_w & 65535)) >>> 0;

    result /= 4294967296;
    return result;
  }
}

