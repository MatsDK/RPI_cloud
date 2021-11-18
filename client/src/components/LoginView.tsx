import { loginMutation } from "graphql/User/login";
import {
  Input,
  Label,
  LoginRegisterPage,
  PageLink,
  SubmitButton,
  Title,
} from "./LoginRegisterPage";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEvent } from "react";
import { useApolloClient } from "react-apollo";
import { useApollo } from "src/hooks/useApollo";
import { useInput } from "src/hooks/useInput";
import styled from "styled-components";
import { ConditionButton } from "../ui/Button";

interface loginViewProps {}

const LoginForm = styled.form`
  z-index: 100;
  padding: 100px 80px;
  display: flex;
  flex-direction: column;
`;
export const LoginView: React.FC<loginViewProps> = ({}) => {
  const { mutate } = useApollo();
  const router = useRouter();
  const client = useApolloClient();

  const [emailInput, setEmailInput] = useInput("");
  const [passwordInput, setPasswordInput] = useInput("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (!passwordInput.trim() || !emailInput.trim()) return;

    const { data } = await mutate(loginMutation, {
      password: passwordInput,
      email: emailInput,
    });

    if (data.login) {
      await client.resetStore();
      router.push("/");
    }
  };

  return (
    <LoginRegisterPage>
      <LoginForm onSubmit={submit}>
        <Title>Sign In</Title>
        <Label>E-mail</Label>
        <Input
          type="text"
          name="email"
          placeholder="@email.com"
          value={emailInput}
          onChange={setEmailInput}
        />
        <Label>Password</Label>
        <Input
          type="password"
          name="password"
          placeholder="password"
          value={passwordInput}
          onChange={setPasswordInput}
        />
        <ConditionButton
          condition={!!emailInput.trim() && !!passwordInput.trim()}
        >
          <SubmitButton type="submit">Sign In</SubmitButton>
        </ConditionButton>
        <Link href="/register">
          <PageLink>Sign Up</PageLink>
        </Link>
      </LoginForm>
    </LoginRegisterPage>
  );
};
