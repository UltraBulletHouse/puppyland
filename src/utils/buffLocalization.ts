import { t } from '../i18n';
import { DogBuffs } from '../types/dog';

export interface LocalizedBuffCopy {
  name: string;
  description: string;
}

const buildKey = (buffSku: string, field: 'name' | 'description'): string =>
  `buffs.items.${buffSku}.${field}`;

export const getLocalizedBuffCopy = (buff: DogBuffs): LocalizedBuffCopy => {
  const nameKey = buildKey(buff.buffSku, 'name');
  const descriptionKey = buildKey(buff.buffSku, 'description');

  const localizedName = t(nameKey);
  const localizedDescription = t(descriptionKey);

  return {
    name: localizedName !== nameKey ? localizedName : buff.name ?? buff.buffSku,
    description:
      localizedDescription !== descriptionKey ? localizedDescription : buff.description ?? '',
  };
};
