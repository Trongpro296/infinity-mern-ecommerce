import newsletterModel from "../models/newsletterModel.js";

const subscribeNewsletter = async (req, res) => {
  try {
    const { email, userId } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required." });
    }

    // Check if email already subscribed
    const existingSubscriber = await newsletterModel.findOne({ email });

    if (existingSubscriber) {
      // Case 1: This email belongs to the same logged-in user
      if (existingSubscriber.userId && existingSubscriber.userId === userId) {
        return res.json({
          success: false,
          message: "You have already subscribed. Your discount code is: BARCA20",
          voucherCode: "BARCA20"
        });
      }

      // Case 2: Email not yet linked to any account → link it now
      if (userId && !existingSubscriber.userId) {
        existingSubscriber.userId = userId;
        await existingSubscriber.save();
        return res.json({
          success: true,
          message: "You have successfully subscribed. Your discount code is: BARCA20",
          voucherCode: "BARCA20"
        });
      }

      // Case 3: Email already taken by another account
      return res.json({
        success: false,
        message: "This email has been used to subscribe by another account."
      });
    }

    // Save new subscriber (link userId if logged in)
    const newSubscriber = new newsletterModel({ email, userId: userId || null });
    await newSubscriber.save();

    res.json({
      success: true,
      message: "You have successfully subscribed. Your discount code is: BARCA20",
      voucherCode: "BARCA20"
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { subscribeNewsletter };
