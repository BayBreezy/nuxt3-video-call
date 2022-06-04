export const useShowSnack = () => useState("showSnackBar", () => false);
export const useSnackText = () => useState("snackText", () => "");
export const useSnackColor = () => useState("snackColor", () => "");

export const useSnack = (
	message: string,
	color: string = "#fff",
	duration: number = 7000
) => {
	useSnackText().value = message;
	useSnackColor().value = color;
	useShowSnack().value = true;
	setTimeout(() => {
		useShowSnack().value = false;
		useSnackText().value = "";
		useSnackColor().value = "";
	}, duration);
};
