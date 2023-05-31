import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { join } from 'path';
@Injectable()
export class ConfiguracionService {
  async getconfig() {
    console.log(process.cwd());
    const env = await fs.readFile(join(process.cwd(), 'env', '.env'), 'utf-8');
    const config = env.split('\r\n');
    const configMap = config
      .filter((c) => {
        return c.startsWith('CONFIGURACION_');
      })
      .reduce((prev, current) => {
        const [name, value] = current.split('=');
        const [pre, sub] = name.split('_');
        return {
          ...prev,
          [sub]: value,
        };
      }, {});
    console.log(configMap);
    return configMap;
  }
  async update(newConfig: Object) {
    const env = await fs.readFile(join(process.cwd(), 'env', '.env'), 'utf-8');
    let config = env.split('\r\n');
    const configMap = config
      .filter((c) => {
        return c.startsWith('CONFIGURACION_');
      })
      .reduce((prev, current) => {
        const [name, value] = current.split('=');
        const [pre, sub] = name.split('_');
        return {
          ...prev,
          [sub]: value,
        };
      }, {});
    config = config.reduce((prev, current) => {
      const [name, value] = current.split('=');
      return {
        ...prev,
        [name]: value,
      };
    }, []);
    const res = [];
    Object.keys(config).forEach((key) => {
      if (key.startsWith('CONFIGURACION_')) {
        const [pre, sub] = key.split('_');
        if (newConfig[sub]) {
          res.push(`${key}=${newConfig[sub]}`);
          process.env[key] = newConfig[sub];
        } else {
          res.push(`${key}=${config[sub]}`);
        }
      } else {
        res.push(`${key}=${config[key]}`);
      }
    });
    await fs.writeFile(join(process.cwd(), 'env', '.env'), res.join('\r\n'));
  }
}
