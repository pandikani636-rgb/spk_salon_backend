import Content from '../models/Content.js';

export const getContent = async (req, res, next) => {
  try {
    const contents = await Content.find();
    res.status(200).json({ success: true, data: contents });
  } catch (error) { next(error); }
};

export const updateContent = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    let content = await Content.findOne({ key });
    if (content) {
      content.value = value;
      await content.save();
    } else {
      content = await Content.create({ key, value });
    }
    res.status(200).json({ success: true, data: content });
  } catch (error) { next(error); }
};
