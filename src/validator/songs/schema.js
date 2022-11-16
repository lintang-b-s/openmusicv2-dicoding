import Joi from 'joi';
/**
 * Kamu bisa menambahkan fungsi integer(), min(), dan max() untuk memberikan maksimal number yang ditetapkan pada nilai tahun. Tujuannya, tentu untuk meningkatkan keakurasian validasi data.
**/

const currentYear = new Date().getFullYear();

const SongsPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(currentYear).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});

export {SongsPayloadSchema};
