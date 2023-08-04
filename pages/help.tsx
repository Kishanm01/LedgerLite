import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box } from "@mui/material";

export default function Help() {
	return (
		<Box sx={{marginLeft: "100px", marginRight: "100px", marginTop: "50px"}}>
			<Typography variant="h6" gutterBottom id="getting-started">
				General
			</Typography>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel1a-content"
					id="panel1a-header"
				>
					<Typography>What is LedgerLite?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						LedgerLite is the simplest accounting software around the world.
						LedgerLite is great for self-starters who are not interested in
						cloud solutions.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel2a-content"
					id="panel2a-header"
				>
					<Typography>What services LedgerLite provides?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						We provide basic accounting features such as:{" "}
						<ul>
							<li>
								Setup and Organize all accounts and its balances of the company.
							</li>
							<li>
								Record transactions in <b>Journal Entries</b>.
							</li>
							<li>
								Maintain accounts by tracking <b>General Ledger</b>.
							</li>
							<li>
								Review snapshot of accounts with <b>Financial Reports</b>{" "}
								(income statement, balance sheet, etc.) as well as{" "}
								<b>Financial Ratio analyzer</b>.
							</li>
							<li>
								Invite users to access account books with controlled user-access
								levels (<b>Administration, Manager, Accountant</b>)
							</li>
						</ul>
					</Typography>
				</AccordionDetails>
			</Accordion>

			<Typography variant="h6" gutterBottom id="login-signup">
				Login/SignUp
			</Typography>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel3a-content"
					id="panel3a-header"
				>
					<Typography>
						I don’t have an account yet. How can I sign Up for one?
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Signing up is easy. On the login page, click on sign up, then fill
						the form with required information about you and wait for approval
						from the Administrator.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel4a-content"
					id="panel4a-header"
				>
					<Typography>
						I successfully signed up. But cannot login to my account?
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						After signing up, the administrator must approve your request before
						you can login. When it is approved, check your email for login
						credentials.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel5a-content"
					id="panel5a-header"
				>
					<Typography>Will I be able to choose what roles I want?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						The administrator assigns the role. Please contact the
						administrator.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel6a-content"
					id="panel6a-header"
				>
					<Typography>
						I am unable to login using my login credentials because it shows
						that “It is suspended”. What should I do?
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Please contact Administrator for any inquiry. Your account may be
						suspended if:
						<ul>
							<li>You have reached the maximum login attempts.</li>
							<li>Your password has expired.</li>
							<li>The administrator has been suspended for other reasons.</li>
						</ul>
					</Typography>
				</AccordionDetails>
			</Accordion>

			<Typography variant="h6" gutterBottom id="chart-accounts">
				Chart of Accounts
			</Typography>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel7a-content"
					id="panel7a-header"
				>
					<Typography>How to use the Accounts page?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						The Accounts page displays all “Active” accounts and its properties
						such as account number, Account description, Normal side, Account
						category, etc. You can search using either account number or account
						name to locate an account in the chart of accounts.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel8a-content"
					id="panel8a-header"
				>
					<Typography>
						Can a Manager or Accountant modify an existing account or create a
						new account?
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Only the Administrator can modify or create an account. Please
						contact the Administrator for modifying an existing account or
						creating a new account.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel9a-content"
					id="panel9a-header"
				>
					<Typography>What is the normal side in an account?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						A normal balance is the side of the T account where the balance is
						normally found. When an amount is accounted for on its normal
						balance side, it increases that account. On the contrary, when an
						amount is accounted for on the opposite side of its normal balance,
						it decreases that amount.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel10a-content"
					id="panel10a-header"
				>
					<Typography>
						How can I contact the Administrator, if I have any questions?
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						On the accounts page, you should see the “Send Email” button. There
						you can choose Manager or Administrator you want to send an email
						to. Write your message in the textbox displayed and click the send
						button.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel11a-content"
					id="panel11a-header"
				>
					<Typography>
						There are hundreds of accounts, I want to filter or search for a
						specific account. What should I do?
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						You should be able to filter the data in the chart of accounts page
						using various tokens such as by account name, number, category,
						subcategory, amount, etc. You should be able to see the filter/sort
						icon above the Accounts table.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel12a-content"
					id="panel12a-header"
				>
					<Typography>
						I want to learn more about other accounts used by businesses.
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						<a
							href="https://www.accountingcoach.com/chart-of-accounts/explanation/2"
							target="_blank"
						>
							Accounting Coach - Chart of Accounts
						</a>{" "}
						{}- provides a great explanation on types of accounts and how to
						make a journal entry.
					</Typography>
				</AccordionDetails>
			</Accordion>

			<Typography variant="h6" gutterBottom id="journal-ledger">
				Journalizing and Ledger
			</Typography>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel13a-content"
					id="panel13a-header"
				>
					<Typography>How do I create a new journal entry?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Creating a journal entry is easy.
						<br /> Just follow these steps:
						<ul>
							<li>Identify the accounts that will be affected</li>{" "}
							<li>
								Determine your account type - The account is debit or credit{" "}
							</li>{" "}
							<li>Enter debit and credit amounts to corresponding accounts</li>{" "}
							<li> Add any comments (Optional)</li>
							<li>Click on Submit button </li>
						</ul>
						Now you know how to prepare a journal entry!
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel4a-content"
					id="panel4a-header"
				>
					<Typography>Can I attach documents to the journal entry?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						<b>Yes! </b> You can attach supporting documentation consisting of
						source documents, supportive calculations, and/or other items
						necessary for accuracy of a journal entry.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel5a-content"
					id="panel5a-header"
				>
					<Typography>
						I don’t see the account where I want to make a new journal entry?
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Account must have been deactivated by the Administrator. Please
						contact them as soon as possible via email.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel5a-content"
					id="panel5a-header"
				>
					<Typography>I am not able to submit a journal entry?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						There must be an error when entering entries. Make sure the total of
						debits and credits are balanced, in other words, total debits and
						total credits round out to be zero.Make sure which account is
						debited and which account is credited. For example, When recording
						the above transaction in the office supplies example, you will be
						increasing your expenses because you purchased office supplies,
						which is an expense account, while decreasing your assets because
						you used your cash account, which is an asset, to purchase those
						supplies.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel6a-content"
					id="panel6a-header"
				>
					<Typography>
						I have submitted a journal entry but cannot see changes in accounts?
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						The journal entry must be approved by the manager or administrator
						in order to see changes on the Accounts page.
					</Typography>
				</AccordionDetails>
			</Accordion>

			<Typography variant="h6" gutterBottom id="adj-entry-reports">
				Adjusting entries and financial Reports
			</Typography>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel17a-content"
					id="panel17a-header"
				>
					<Typography>What does it mean to adjust a journal entry?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Made at the end of an accounting period to reflect each transaction
						or event that has not yet been recorded or recorded on the proper
						period. The purpose of adjustment is to better align your financial
						statements with your income and expenses.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel18a-content"
					id="panel18a-header"
				>
					<Typography>
						I want to modify the adjusted entry after submitting it?
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Once an adjusting journal entry is submitted the accountant{" "}
						<b>cannot</b>
						delete it. However, you can cancel or reset an adjusting journal
						entry before it is submitted, if restarting is desired.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel19a-content"
					id="panel19a-header"
				>
					<Typography>
						<b>Accountants Only:</b> {} I want to download financial reports for
						filing.
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Please contact your Manager for obtaining trial balance, income
						statements, balance sheets, or retained earnings statements.
					</Typography>
				</AccordionDetails>
			</Accordion>
		</Box>
	);
}
