import React, { useEffect, useState } from "react";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
	GetServerSidePropsContext,
	PreviewData,
	NextApiRequest,
	NextApiResponse,
	InferGetServerSidePropsType,
} from "next";
import { ParsedUrlQuery } from "querystring";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
	Avatar,
	Box,
	Button,
	Typography,
	TextField,
	OutlinedInput,
	InputAdornment,
	IconButton,
	FormControl,
	InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { tr } from "date-fns/locale";

export const getServerSideProps = async (
	ctx:
		| GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
		| { req: NextApiRequest; res: NextApiResponse<any> }
) => {
	// Create authenticated Supabase Client
	const supabase = createServerSupabaseClient(ctx);
	// Check if we have a session
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session)
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			},
		};

	return {
		props: {
			initialSession: session,
			user: session.user,
		},
	};
};

export default function Profile(
	props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
	const [userData, setUserData] = useState<
		[
			{
				address: string | null;
				avatar_url: string | null;
				email: string;
				full_name: string;
				first_name: string;
				last_name: string;
				id: string;
				role: string;
				website: string;
			}
		]
	>([
		{
			address: null,
			avatar_url: null,
			email: "",
			full_name: "",
			first_name: "",
			last_name: "",
			id: "",
			role: "",
			website: "",
		},
	]);

	const [file, setFile] = useState<File>();

	const supabase = useSupabaseClient();

	const handleFileChange = async (e: any) => {
		const selectedFile = e.target.files[0];

		if (selectedFile) {
			// If user selects a file from their computer, upload it.
			try {
				const { data, error } = await supabase.storage
					.from("avatars")
					.upload(`${props.user.id}/profile-picture`, selectedFile, {
						cacheControl: "3600",
						upsert: true,
					});
				if (error) {
					throw error;
				}

				// Get the public link back from supabase storage.
				const { data: publicUrl } = await supabase.storage
					.from("avatars")
					.getPublicUrl(`${props.user.id}/profile-picture`);

				// Update table in DB with that link.
				const { data: d, error: e } = await supabase
					.from(`profiles`)
					.update({ avatar_url: `${publicUrl.publicUrl}` })
					.eq("id", props.user.id);
				if (e) throw e;
				setFile(selectedFile);
			} catch (error: any) {
				alert(error.error_description || error.message);
			}
		}
	};

	const [firstName, setFirstName] = React.useState("");
	const [editFirstName, setEditFirstName] = React.useState(false);
	const [lastName, setLastName] = React.useState("");
	const [editLastName, setEditLastName] = React.useState(false);
	const [newEmail, setNewEmail] = React.useState("");
	const [editEmail, setEditEmail] = React.useState(false);

	const saveFirstName = async () => {
		setEditFirstName(false);

		try {
			// Attempt to update First Name

			const { data, error } = await supabase
				.from("profiles")
				.update({ first_name: firstName })
				.eq("id", props.user.id);

			if (error) {
				throw error;
			}

			const { data: data2, error: error2 } = await supabase
				.from("profiles")
				.update({ full_name: firstName + " " + userData[0].last_name })
				.eq("id", props.user.id);

			if (error2) {
				throw error2;
			}
			getUserInfo();
		} catch (error: any) {
			alert(error.error_description || error.message);
		}
	};

	const saveLastName = async () => {
		setEditLastName(false);

		try {
			// Attempt to update Last Name

			const { data, error } = await supabase
				.from("profiles")
				.update({ last_name: lastName })
				.eq("id", props.user.id);

			if (error) {
				throw error;
			}

			const { data: data2, error: error2 } = await supabase
				.from("profiles")
				.update({ full_name: userData[0].first_name + " " + lastName })
				.eq("id", props.user.id);

			if (error2) {
				throw error2;
			}
			getUserInfo();
		} catch (error: any) {
			alert(error.error_description || error.message);
		}
	};


	const saveEmail = async () => {
		setEditEmail(false);

		try {
			// Attempt to update Email
			const { data, error } = await supabase.auth.updateUser({
				email: newEmail,
			});

			if (error) {
				throw error;
			}

			// console.log(data);
			 alert("Sent confirmation email to " + data.user.email + " to update to " + data.user.new_email);
			const { data: data2, error: error2 } = await supabase
				.from("profiles")
				.update({ email: newEmail })
				.eq("id", props.user.id);

			if (error2) {
				throw error2;
			}
			getUserInfo();
		} catch (error: any) {
			alert(error.error_description || error.message);
		}
	};

	const getUserInfo = async () => {
		// Select all users info from the profiles table.
		try {
			const { data, error } = await supabase
				.from(`profiles`)
				.select("*")
				.eq("id", props.user.id);
			if (error) {
				throw error;
			}
			//@ts-ignore
			setUserData(data);
			setFirstName(data[0].first_name);
			setLastName(data[0].last_name);
			setNewEmail(data[0].email);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getUserInfo();
	}, [props.user.id, file]);
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				margin: "auto",
				textAlign: "Left",
				marginRight: "75%",
				paddingTop: "30px",
				alignItems: "Left",
			}}
		>
			<Typography variant="h3">My Profile</Typography>
			<Typography variant="h4">{userData[0].full_name}</Typography>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					margin: "auto",
					textAlign: "Left",
					paddingTop: "30px",
					alignItems: "Center",
				}}
			>
				<Avatar
					alt="profile picture"
					src={userData[0].avatar_url ?? undefined}
					sx={{ width: 200, height: 200 }}
				>
					{userData[0].full_name.charAt(0)}
				</Avatar>
				<Button variant="text" component="label">
					Upload Photo{" "}
					<input
						hidden
						accept="image/*"
						type="file"
						onChange={handleFileChange}
					/>
				</Button>
			</Box>

			{/* <input type="file" style={{ display: "none" }} onChange={handleFileChange} ref={fileInputRef} /> */}

			<br></br>
			<TextField
				variant="outlined"
				label="First Name"
				value={!editFirstName ? userData[0].first_name : firstName}
				disabled={!editFirstName}
				onChange={(e) => setFirstName(e.target.value)}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							{!editFirstName ? (
								<IconButton
									aria-label="Edit First Name"
									onClick={(e) => {
										setEditFirstName(true);
										setFirstName(userData[0].first_name);
									}}
									edge="end"
								>
									<EditIcon />
								</IconButton>
							) : (
								<div>
									<IconButton
										aria-label="Cancel"
										onClick={(e) => setEditFirstName(false)}
										edge="end"
									>
										<CancelIcon />
									</IconButton>
									<IconButton
										aria-label="Save"
										onClick={saveFirstName}
										edge="end"
									>
										<SaveIcon />
									</IconButton>
								</div>
							)}
						</InputAdornment>
					),
				}}
			/>

			<br></br>

			<TextField
				variant="outlined"
				label="Last Name"
				value={!editLastName ? userData[0].last_name : lastName}
				disabled={!editLastName}
				onChange={(e) => setLastName(e.target.value)}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							{!editLastName ? (
								<IconButton
									aria-label="Edit Last Name"
									onClick={(e) => {
										setEditLastName(true);
										setLastName(userData[0].last_name);
									}}
									edge="end"
								>
									<EditIcon />
								</IconButton>
							) : (
								<div>
									<IconButton
										aria-label="Cancel"
										onClick={(e) => setEditLastName(false)}
										edge="end"
									>
										<CancelIcon />
									</IconButton>
									<IconButton
										aria-label="Save"
										onClick={saveLastName}
										edge="end"
									>
										<SaveIcon />
									</IconButton>
								</div>
							)}
						</InputAdornment>
					),
				}}
			/>

			<br></br>

			<TextField
				variant="outlined"
				label="Email"
				value={!editEmail ? userData[0].email : newEmail}
				disabled={!editEmail}
				onChange={(e) => setNewEmail(e.target.value)}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							{!editEmail ? (
								<IconButton
									aria-label="Edit Email"
									onClick={(e) => {
										setEditEmail(true);
										setNewEmail(userData[0].email);
									}}
									edge="end"
								>
									<EditIcon />
								</IconButton>
							) : (
								<div>
									<IconButton
										aria-label="Cancel"
										onClick={(e) => setEditEmail(false)}
										edge="end"
									>
										<CancelIcon />
									</IconButton>
									<IconButton aria-label="Save" onClick={saveEmail} edge="end">
										<SaveIcon />
									</IconButton>
								</div>
							)}
						</InputAdornment>
					),
				}}
			/>

			<br></br>

			<Button variant="outlined" href="update-password">
				Update Password
			</Button>
		</Box>
	);
}
