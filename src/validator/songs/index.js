import InvariantError from '../../exceptions/InvariantError.js';
import {SongPayloadSchema} from './schema.js';

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default SongsValidator;
