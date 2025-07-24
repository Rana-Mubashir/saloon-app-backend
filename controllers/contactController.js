import { ContactUs } from "../models/contactModel.js";

export const createContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const newContact = new ContactUs({
      name,
      email,
      message,
    });

    await newContact.save();

    return res.status(201).json({
      success: true,
      message: "Contact submitted successfully",
      data: {
        id: newContact.id,
        email: newContact.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await ContactUs.findByIdAndDelete(id);

    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const contacts = await ContactUs.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalContacts = await ContactUs.countDocuments(query);
    const totalPages = Math.ceil(totalContacts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        current_page: page,
        per_page: limit,
        total_items: totalContacts,
        total_pages: totalPages,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
