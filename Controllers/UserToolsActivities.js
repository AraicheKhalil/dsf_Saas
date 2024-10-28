// const UserActivities = require('../Models/UserToolsActivities');
// const User = require('../Models/User'); // Import User model to get membership type

// // Controller to handle tool submissions with membership-based limits
// const trackToolSubmission = async (req, res) => {
//   const { toolCategory, toolType } = req.body; // Get tool category and type from the request
//   const userId = req.user._id; // Get user ID from authenticated user

//   try {
//     // Get user's membership from the User model
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     const membership = user.membership; // "basic" or "pro"
//     // const submissionLimit = membership === 'pro' ? 1000 : 10; // Set limit based on membership
//     const submissionLimit = membership === 'pro' ? 15 : 10; // Set limit based on membership

//     // Find or create the user's activity record
//     let userActivities = await UserActivities.findOne({ user: userId });

//     if (!userActivities) {
//       // If no activity record exists, create a new one
//       userActivities = new UserActivities({
//         user: userId,
//         activities: [{ toolCategory, toolType, submissions: 1 }],
//       });
//     } else {
//       // Find the specific activity for the tool type
//       const activity = userActivities.activities.find(
//         (act) => act.toolCategory === toolCategory && act.toolType === toolType
//       );

//       if (activity) {
//         // Increment submissions for the specific tool
//         activity.submissions += 1;
//       } else {
//         // If the tool activity does not exist, add it
//         userActivities.activities.push({ toolCategory, toolType, submissions: 1 });
//       }
//     }

//     // Save the updated user activities
//     await userActivities.save();

//     // Check if total submissions for the tool category exceed the limit based on membership
//     const totalSubmissions = userActivities.activities
//       .filter((act) => act.toolCategory === toolCategory)
//       .reduce((sum, act) => sum + act.submissions, 0);

//     if (totalSubmissions >= submissionLimit) {
//       return res.status(200).json({
//         message: `You have reached the ${membership} limit of ${submissionLimit} submissions for ${toolCategory}. Please upgrade your membership.`,
//       });
//     }

//     res.status(200).json({
//       message: 'Submission tracked successfully.',
//       membership : membership,
//       data: userActivities,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'Error tracking submission',
//       error: error.message,
//     });
//   }
// };

// // Controller to get the user's submission data
// const getUserSubmissions = async (req, res) => {
//   const userId = req.user._id; // Get user ID from authenticated user

//   try {
//     const userActivities = await UserActivities.findOne({ user: userId });
//     if (!userActivities) {
//       return res.status(404).json({ message: 'No activities found for this user.' });
//     }

//     res.status(200).json({
//       message: 'User activities fetched successfully.',
//       data: userActivities,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'Error fetching user activities',
//       error: error.message,
//     });
//   }
// };

// module.exports = {
//   trackToolSubmission,
//   getUserSubmissions,
// };


const UserActivities = require('../Models/UserToolsActivities');
const User = require('../Models/User'); // Import User model to get membership type
const PaymentRequired  = require('../Errors/PaymentRequired');
const NotFoundError  = require('../Errors/not-found');
const BadRequestError = require("../Errors/bad-request");
const mongoose = require('mongoose');



// Controller to handle tool submissions with membership-based limits
const trackToolSubmission = async (req, res) => {
    const { toolCategory, toolType } = req.body; // Get tool category (SmartDoc or GenAI) and toolType from the request
    const userId = req.user._id; // Get user ID from authenticated user

    // Get user's membership from the User model
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("User Not found");
    }

    const membership = user.membership; // "basic" or "pro"
    const submissionLimit = membership === 'pro' ? 100 : 10; // Set limit based on membership

    // Find or create the user's activity record
    let userActivities = await UserActivities.findOne({ user: userId });

    if (!userActivities) {
      // Create new user activities document if not exists
      userActivities = new UserActivities({ user: userId });
    }

    let activity;

    // Handle SmartDoc submissions
    if (toolCategory === 'SmartDoc') {
      activity = userActivities.SmartDoc.find((act) => act.toolType === toolType);
      if (activity) {
        activity.submissions += 1;
      } else {
        userActivities.SmartDoc.push({ toolType, submissions: 1 });
      }

      // Check total submissions for SmartDoc tools
      const totalSmartDocSubmissions = userActivities.SmartDoc.reduce((sum, act) => sum + act.submissions, 0);
      if (totalSmartDocSubmissions >= submissionLimit) {
        // return res.status(200).json({
        //   message: `You have reached the ${membership} limit of ${submissionLimit} submissions for SmartDoc. Please upgrade your membership.`,
        // });
        // throw new NotFoundError(`You have reached the ${membership} limit of ${submissionLimit} submissions for SmartDoc. Please upgrade your membership.`)
        throw new PaymentRequired(`You have reached the ${membership} limit of ${submissionLimit} submissions for SmartDoc. Please upgrade your membership.`);
      }
    }

    // Handle GenAI submissions
    else if (toolCategory === 'GenAI') {
      activity = userActivities.GenAI.find((act) => act.toolType === toolType);
      if (activity) {
        activity.submissions += 1;
      } else {
        userActivities.GenAI.push({ toolType, submissions: 1 });
      }

      // Check total submissions for GenAI tools
      const totalGenAISubmissions = userActivities.GenAI.reduce((sum, act) => sum + act.submissions, 0);
      if (totalGenAISubmissions >= submissionLimit) {
        // return res.status(200).json({
        //   message: `You have reached the ${membership} limit of ${submissionLimit} submissions for GenAI. Please upgrade your membership.`,
        // });
        throw new PaymentRequired(`You have reached the ${membership} limit of ${submissionLimit} submissions for GenAI. Please upgrade your membership.`);
      }
    }

    // Save updated activities
    await userActivities.save();

    res.status(200).json({
      access : true,
      message: 'Submission tracked successfully.',
      data: userActivities,
    });

};

// Controller to get the user's submission data
const getUserSubmissions = async (req, res) => {
  const userId = req.user._id; // Get user ID from authenticated user

  const userActivities = await UserActivities.findOne({ user: userId });
    if (!userActivities) {
      throw new NotFoundError("No activities found for this user.")
    }

    res.status(200).json({
      message: 'User activities fetched successfully.',
      data: userActivities,
    });
};


const getDateRange = (days) => {
  const today = new Date();
  return new Date(today.setDate(today.getDate() - days));
};

// Controller to get submission statistics for TinyChartBar
const getSubmissionStatistics = async (req, res) => {
  const userId = req.user._id;

    // Retrieve the user's activities
    const userActivities = await UserActivities.findOne({ user: userId });
    if (!userActivities) {
      return res.status(404).json({ message: 'No activities found for this user.' });
    }

    // Define date ranges for last 7 days, 3 months, and 6 months
    const sevenDaysAgo = getDateRange(1);
    const threeMonthsAgo = getDateRange(90);
    const sixMonthsAgo = getDateRange(180);

    // Helper function to filter and summarize submissions
    const filterAndSummarize = (activities, dateRange) => {
      return activities
        .filter((activity) => new Date(activity.createdAt) >= dateRange)
        .reduce((acc, activity) => {
          const existingTool = acc.find((item) => item.toolType === activity.toolType);
          if (existingTool) {
            existingTool.submissions += activity.submissions;
          } else {
            acc.push({
              toolType: activity.toolType,
              submissions: activity.submissions,
            });
          }
          return acc;
        }, []);
    };

    // Calculate statistics for each timeframe and tool category
    const statistics = {
      SmartDoc: {
        last7Days: filterAndSummarize(userActivities.SmartDoc, sevenDaysAgo),
        last3Months: filterAndSummarize(userActivities.SmartDoc, threeMonthsAgo),
        last6Months: filterAndSummarize(userActivities.SmartDoc, sixMonthsAgo),
      },
      GenAI: {
        last7Days: filterAndSummarize(userActivities.GenAI, sevenDaysAgo),
        last3Months: filterAndSummarize(userActivities.GenAI, threeMonthsAgo),
        last6Months: filterAndSummarize(userActivities.GenAI, sixMonthsAgo),
      },
    };

    res.status(200).json({
      message: 'Submission statistics retrieved successfully',
      data: statistics,
    });
  
};


// const getDashboardSubmissionCounts = async (req, res) => {
//   const userId = req.user._id;

//   try {
//     // Retrieve the user and check membership type
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     // Set limits based on membership type
//     const membership = user.membership; // "free" or "pro"
//     const submissionLimit = membership === 'pro' ? 10 : 5; // 1000 for pro, 10 for free

//     // Retrieve user's activity record
//     const userActivities = await UserActivities.findOne({ user: userId });
//     if (!userActivities) {
//       return res.status(404).json({ message: 'No activities found for this user.' });
//     }

//     // Calculate total submissions and remaining submissions for SmartDoc and GenAI
//     const calculateSubmissions = (activities, limit) => {
//       const totalSubmissions = activities.reduce((sum, activity) => sum + activity.submissions, 0);
//       const remainingSubmissions = limit - totalSubmissions;
//       return {
//         totalSubmissions,
//         remainingSubmissions: remainingSubmissions > 0 ? remainingSubmissions : 0
//       };
//     };

//     const smartDocStats = calculateSubmissions(userActivities.SmartDoc, submissionLimit);
//     const genAIStats = calculateSubmissions(userActivities.GenAI, submissionLimit);

//     res.status(200).json({
//       message: 'Dashboard submission counts retrieved successfully',
//       data: {
//         SmartDoc: {
//           totalSubmissions: smartDocStats.totalSubmissions,
//           remainingSubmissions: smartDocStats.remainingSubmissions
//         },
//         GenAI: {
//           totalSubmissions: genAIStats.totalSubmissions,
//           remainingSubmissions: genAIStats.remainingSubmissions
//         }
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'Error fetching dashboard submission counts',
//       error: error.message,
//     });
//   }
// };

const getDashboardSubmissionCounts = async (req, res) => {
  const userId = req.user._id;

  try {
    // Retrieve the user and check membership type
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Set limits based on membership type
    const membership = user.membership; // "free" or "pro"
    const submissionLimit = membership === 'pro' ? 100 : 10; // 1000 for pro, 10 for free

    // Retrieve user's activity record
    const userActivities = await UserActivities.findOne({ user: userId });
    if (!userActivities) {
      return res.status(404).json({ message: 'No activities found for this user.' });
    }

    // Calculate total submissions and remaining submissions for SmartDoc and GenAI
    const calculateSubmissions = (activities, limit) => {
      const totalSubmissions = activities.reduce((sum, activity) => sum + activity.submissions, 0);
      const remainingSubmissions = limit - totalSubmissions;
      return {
        totalSubmissions,
        remainingSubmissions: remainingSubmissions > 0 ? remainingSubmissions : 0
      };
    };

    // Calculate statistics with tool name included
    const smartDocStats = {
      name: 'SmartDoc',
      ...calculateSubmissions(userActivities.SmartDoc, submissionLimit),
    };

    const genAIStats = {
      name: 'GenAI',
      ...calculateSubmissions(userActivities.GenAI, submissionLimit),
    };

    res.status(200).json({
      message: 'Dashboard submission counts retrieved successfully',
      data: {
        SmartDoc: smartDocStats,
        GenAI: genAIStats,
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching dashboard submission counts',
      error: error.message,
    });
  }
};

module.exports = {
  trackToolSubmission,
  getUserSubmissions,
  getSubmissionStatistics,
  getDashboardSubmissionCounts
};
